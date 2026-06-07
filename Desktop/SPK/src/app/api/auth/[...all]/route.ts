import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{
			error: {
				code: "AUTH_NOT_ENABLED",
				message: "Auth provider belum diaktifkan untuk blackbox testing.",
			},
		},
		{ status: 501 },
	);
}

export async function POST() {
	return NextResponse.json(
		{
			error: {
				code: "AUTH_NOT_ENABLED",
				message: "Auth provider belum diaktifkan untuk blackbox testing.",
			},
		},
		{ status: 501 },
	);
}
