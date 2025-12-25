/**
 * Cleanup script for ESP32-only builds
 *
 * This script removes toolchains and firmwares for devices other than ESP32
 * to reduce the installer size significantly.
 *
 * Usage: node scripts/cleanup-for-esp32-only.js
 *
 * Run this AFTER 'npm run fetch:all' and BEFORE 'npm run doBuild'
 */

const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// Toolchains to REMOVE (keep only esp32 and builtin)
const toolchainsToRemove = [
    'arduino',      // AVR (Arduino Uno, Mega, etc.)
    'esp8266',      // ESP8266
    'Maixduino',    // RISC-V / K210
    'rp2040',       // Raspberry Pi Pico
    'SparkFun'      // SparkFun boards
];

// Firmwares to REMOVE (keep only esp32)
const firmwaresToRemove = [
    'arduino',
    'esp8266',
    'microbit',
    'k210'
];

async function cleanup() {
    console.log('=== ESP32-Only Cleanup Script ===\n');

    let totalSaved = 0;

    // Clean up toolchains
    const packagesDir = path.join(projectRoot, 'tools', 'Arduino', 'packages');
    if (fs.existsSync(packagesDir)) {
        console.log('Removing non-ESP32 toolchains...');
        for (const toolchain of toolchainsToRemove) {
            const toolchainPath = path.join(packagesDir, toolchain);
            if (fs.existsSync(toolchainPath)) {
                try {
                    fs.removeSync(toolchainPath);
                    console.log(`  Removed: ${toolchain}`);
                } catch (err) {
                    console.log(`  Failed to remove ${toolchain}: ${err.message}`);
                }
            }
        }
    }

    // Clean up firmwares
    const firmwaresDir = path.join(projectRoot, 'firmwares');
    if (fs.existsSync(firmwaresDir)) {
        console.log('\nRemoving non-ESP32 firmwares...');
        for (const firmware of firmwaresToRemove) {
            const firmwarePath = path.join(firmwaresDir, firmware);
            if (fs.existsSync(firmwarePath)) {
                try {
                    fs.removeSync(firmwarePath);
                    console.log(`  Removed: ${firmware}`);
                } catch (err) {
                    console.log(`  Failed to remove ${firmware}: ${err.message}`);
                }
            }
        }
    }

    console.log('\n=== Cleanup Complete ===');
    console.log('The installer will now only include ESP32 support.');
    console.log('To include all devices, run "npm run fetch:all" again before building.\n');
}

cleanup().catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
});
