import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Basic shape check
    const required = [
      "fullName",
      "email",
      "phone",
      "college",
      "department",
      "ideaTitle",
      "ideaSummary",
    ];
    for (const key of required) {
      if (!body[key]) {
        return NextResponse.json({ error: `${key} missing` }, { status: 400 });
      }
    }

    // TODO: Persist to database or Google Sheets.
    // For now, echo success.
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}


