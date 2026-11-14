import path from 'node:path';

/**
 * System and Installed Directory Protected Roots
 * Files within these locations must NEVER be touched or organized.
 */
const PROTECTED_SYSTEM_PATHS = [
  // Windows
  'c:\\windows',
  'c:\\program files',
  'c:\\program files (x86)',
  'c:\\programdata',
  '\\system32',
  '\\syswow64',
  '\\winsxs',
  // Unix / Linux / macOS
  '/system',
  '/library',
  '/applications',
  '/usr',
  '/etc',
  '/bin',
  '/sbin',
  '/var',
  '/lib',
  '/opt',
  '/boot',
  '/dev',
  '/proc',
  '/sys'
];

/**
 * Checks if a path is located inside a protected operating system or installed application directory.
 */
export function isProtectedSystemPath(targetPath) {
  if (!targetPath) return true;
  const normalized = path.resolve(targetPath).toLowerCase();

  for (const sysPath of PROTECTED_SYSTEM_PATHS) {
    if (normalized.startsWith(sysPath.toLowerCase())) {
      return true;
    }
  }

  // Windows AppData installed programs protection
  if (normalized.includes('\\appdata\\local\\programs') || normalized.includes('\\appdata\\roaming\\microsoft\\windows\\start menu')) {
    return true;
  }

  return false;
}

/**
 * Classifies installer packages into safe categories.
 */
export function classifyInstaller(fileName, extension) {
  const ext = extension.toLowerCase().replace(/^\./, '');

  if (ext === 'apk' || ext === 'xapk' || ext === 'apkm') {
    return { isInstaller: true, packageType: 'Android APK', safeToMove: true };
  }
  if (ext === 'msi') {
    return { isInstaller: true, packageType: 'Windows MSI Installer', safeToMove: true };
  }
  if (ext === 'dmg' || ext === 'pkg') {
    return { isInstaller: true, packageType: 'macOS Package', safeToMove: true };
  }
  if (ext === 'appimage') {
    return { isInstaller: true, packageType: 'Linux AppImage', safeToMove: true };
  }
  if (ext === 'deb' || ext === 'rpm') {
    return { isInstaller: true, packageType: 'Linux Package', safeToMove: true };
  }
  if (ext === 'exe') {
    const name = fileName.toLowerCase();
    const isSetupExe = name.includes('setup') || name.includes('install') || name.includes('installer') || name.includes('patch');
    return {
      isInstaller: true,
      packageType: isSetupExe ? 'Windows Setup Executable' : 'Windows Executable',
      safeToMove: true
    };
  }

  return { isInstaller: false, packageType: null, safeToMove: true };
}
