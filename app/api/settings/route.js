import { db } from "@/utils/db";
import { UserSettings } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;

    const settings = await db
      .select()
      .from(UserSettings)
      .where(eq(UserSettings.userEmail, userEmail));

    if (settings.length === 0) {
      // Create default settings if none exist
      const defaultSettings = {
        userEmail,
        darkMode: false,
        notifications: true,
        sound: true,
        voiceResponse: false,
        interviewDuration: 15,
        autoSave: true,
        privacyMode: false,
        volume: 80,
      };

      const newSettings = await db
        .insert(UserSettings)
        .values(defaultSettings)
        .returning();

      return NextResponse.json(newSettings[0]);
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    const updates = await request.json();

    // Check if settings exist
    const existingSettings = await db
      .select()
      .from(UserSettings)
      .where(eq(UserSettings.userEmail, userEmail));

    if (existingSettings.length === 0) {
      // If no settings exist, create them
      const newSettings = await db
        .insert(UserSettings)
        .values({ ...updates, userEmail })
        .returning();

      return NextResponse.json(newSettings[0]);
    }

    // Update existing settings
    const updatedSettings = await db
      .update(UserSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(UserSettings.userEmail, userEmail))
      .returning();

    return NextResponse.json(updatedSettings[0]);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
