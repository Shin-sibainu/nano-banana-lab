import { NextResponse } from "next/server";
import type { Preset } from "@/lib/types";
import { presets } from "@/lib/presets";

export async function GET() {
  return NextResponse.json(presets);
}

export async function POST(request: Request) {
  const newPreset: Preset = await request.json();

  if (!newPreset.id) {
    newPreset.id = newPreset.title.toLowerCase().replace(/\s+/g, "-");
  }

  presets.push(newPreset);
  return NextResponse.json(newPreset);
}

export async function PUT(request: Request) {
  const updatedPreset: Preset = await request.json();
  const index = presets.findIndex((p) => p.id === updatedPreset.id);

  if (index !== -1) {
    presets[index] = updatedPreset;
    return NextResponse.json(updatedPreset);
  }

  return NextResponse.json({ error: "Preset not found" }, { status: 404 });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  const index = presets.findIndex((p) => p.id === id);

  if (index !== -1) {
    const deleted = presets.splice(index, 1)[0];
    return NextResponse.json(deleted);
  }

  return NextResponse.json({ error: "Preset not found" }, { status: 404 });
}
