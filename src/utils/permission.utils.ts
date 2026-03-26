export const canAccessMenuItem = (
    requiredPermission?: string,
    hasPermission?: (p: string) => boolean
) => {
    if (!requiredPermission) return true
    if (!hasPermission) return false

    const hasAccess = hasPermission(requiredPermission)
    // console.log(`Permission check: ${requiredPermission} = ${hasAccess}`)
    return hasAccess
}
