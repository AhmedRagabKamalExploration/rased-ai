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
    domain: string
  ): Promise<boolean> {
    const org = await this.findById(organizationId);
    if (!org) return false;

    // Check if the domain is in the whitelist
    return org.whitelistedDomains.some((whitelistedDomain) => {
      // Support wildcard domains like *.example.com
      if (whitelistedDomain.startsWith("*.")) {
        const pattern = whitelistedDomain.substring(2);
        return domain.endsWith(pattern);
      }
      return domain === whitelistedDomain;
    });
  }
}
