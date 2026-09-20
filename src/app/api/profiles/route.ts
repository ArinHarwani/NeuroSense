import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DemoProfile } from '@/types/narcosense';
import defaultProfilesData from '@/config/demo-profiles.json';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'demo-profiles.json');

function getProfiles(): DemoProfile[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.profiles)) {
        return parsed.profiles;
      }
    }
  } catch (err) {
    console.error('Error reading demo-profiles.json:', err);
  }
  return defaultProfilesData.profiles as DemoProfile[];
}

function saveProfiles(profiles: DemoProfile[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify({ profiles }, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing demo-profiles.json:', err);
    return false;
  }
}

export async function GET() {
  const profiles = getProfiles();
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, profiles: newProfilesList } = body;

    // If a full list update is provided
    if (Array.isArray(newProfilesList)) {
      saveProfiles(newProfilesList);
      return NextResponse.json({ success: true, profiles: newProfilesList });
    }

    // If a single profile addition or update is provided
    if (!profile || !profile.code || !profile.displayName || !profile.scientificName) {
      return NextResponse.json(
        { error: 'Code, Display Name, and Scientific Name are required.' },
        { status: 400 }
      );
    }

    const { gasSensor1, gasSensor2, gasSensor3 } = profile.fingerprint || {};
    if (
      gasSensor1 === undefined || gasSensor1 < 0 || gasSensor1 > 1 ||
      gasSensor2 === undefined || gasSensor2 < 0 || gasSensor2 > 1 ||
      gasSensor3 === undefined || gasSensor3 < 0 || gasSensor3 > 1
    ) {
      return NextResponse.json(
        { error: 'Gas Sensor 1, 2, and 3 values must be between 0.00 and 1.00.' },
        { status: 400 }
      );
    }

    const currentProfiles = getProfiles();
    const existingIndex = currentProfiles.findIndex((p) => p.code === profile.code);

    if (existingIndex >= 0) {
      // Update existing
      currentProfiles[existingIndex] = {
        ...currentProfiles[existingIndex],
        ...profile,
        fingerprint: {
          gasSensor1: Number(gasSensor1.toFixed(2)),
          gasSensor2: Number(gasSensor2.toFixed(2)),
          gasSensor3: Number(gasSensor3.toFixed(2)),
        },
      };
    } else {
      // Add new
      currentProfiles.push({
        code: profile.code.trim(),
        displayName: profile.displayName.trim(),
        scientificName: profile.scientificName.trim(),
        fingerprint: {
          gasSensor1: Number(gasSensor1.toFixed(2)),
          gasSensor2: Number(gasSensor2.toFixed(2)),
          gasSensor3: Number(gasSensor3.toFixed(2)),
        },
        active: profile.active !== false,
      });
    }

    saveProfiles(currentProfiles);
    return NextResponse.json({ success: true, profiles: currentProfiles });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to save profile: ' + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
