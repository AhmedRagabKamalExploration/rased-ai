import { db } from "@/db";
import { organizations } from "../schema";
import { eq, and } from "drizzle-orm";
import type { Organization, NewOrganization } from "../schema";

export class OrganizationRepository {
  public async findById(id: string): Promise<Organization | undefined> {
    return db.query.organizations.findFirst({
      where: and(eq(organizations.id, id), eq(organizations.isActive, true)),
    });
  }

  public async findBySecretKey(key: string): Promise<Organization | undefined> {
    return db.query.organizations.findFirst({
      where: and(
        eq(organizations.secretApiKey, key),
        eq(organizations.isActive, true)
      ),
    });
  }

  public async create(data: NewOrganization): Promise<Organization> {
    const result = await db.insert(organizations).values(data).returning();
    return result[0];
  }

  public async validateDomain(
    organizationId: string,
    origin: string
  ): Promise<boolean> {
    const org = await this.findById(organizationId);

    console.log("org", org);

    if (!org) {
      console.warn(
        `[OrgRepo] Organization with ID '${organizationId}' not found or inactive.`
      );
      return false;
    }

    let parsedHost;
    try {
      const url = new URL(origin);
      parsedHost = url.host; // This includes both hostname and port
    } catch (e) {
      // If the origin is not a valid URL (e.g., just a domain name), use it as-is.
      console.warn(`[OrgRepo] Invalid URL format for origin: ${origin}.`);
      parsedHost = origin;
    }

    const isDomainWhitelisted = org.whitelistedDomains.some(
      (whitelistedDomain) => {
        // Direct match
        if (parsedHost === whitelistedDomain) {
          return true;
        }
        // Wildcard subdomain match
        if (whitelistedDomain.startsWith("*.")) {
          const pattern = whitelistedDomain.substring(2);
          return parsedHost.endsWith(pattern);
        }
        return false;
      }
    );

    if (!isDomainWhitelisted) {
      console.warn(
        `[OrgRepo] Origin '${origin}' (parsed as '${parsedHost}') is not in the whitelist.`
      );
    }

    return isDomainWhitelisted;
  }
}
