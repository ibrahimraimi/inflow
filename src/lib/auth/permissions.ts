import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete"],
} as const;

const access = createAccessControl(statement);

const member = access.newRole({
  project: ["create"],
});

const admin = access.newRole({
  project: ["create", "update"],
});

const owner = access.newRole({
  project: ["create", "update", "delete"],
  organization: ["update", "delete"],
});

export { access, admin, member, owner, statement };
