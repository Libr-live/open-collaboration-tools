// ******************************************************************************
// Copyright 2026 TypeFox GmbH
// This program and the accompanying materials are made available under the
// terms of the MIT License, which is available in the project root.
// ******************************************************************************

import type { Permissions } from '../types.js';

export const USER_PERMISSION_PREFIX = 'user:';

export type UserPermissionOverride = 'readonly' | 'readwrite';

export function getUserPermissionKey(peerId: string): string {
    return `${USER_PERMISSION_PREFIX}${peerId}`;
}

export function encodeUserPermission(readonly: boolean): UserPermissionOverride {
    return readonly ? 'readonly' : 'readwrite';
}

export function resolveReadonly(permissions: Permissions, peerId?: string): boolean {
    if (peerId) {
        const override = permissions[getUserPermissionKey(peerId)];
        if (override === 'readonly') {
            return true;
        }
        if (override === 'readwrite') {
            return false;
        }
        if (typeof override === 'boolean') {
            return override;
        }
    }
    return !!permissions.readonly;
}
