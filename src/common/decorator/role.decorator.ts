import { SetMetadata } from "@nestjs/common"
import { UserRole } from "src/user/enum/user.enum";

export const ROLE_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLE_KEY, roles);