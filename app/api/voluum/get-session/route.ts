import { VoluumApiConfig } from "@/lib/features/ads-manager/voluum/config/VoluumApiConfig";
import { NextResponse } from "next/server";
export const GET = async () => {
  const { baseUrl, auth } = new VoluumApiConfig();
  const response = await fetch(`${baseUrl}/auth/access/session`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(auth),
  });

  if (!response.ok) {
    const { error } = await response.json();
    console.error(error);
    return NextResponse.json(
      {
        isSuccess: false,
        message: error.message,
        data: [],
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      isSuccess: true,
      message: "Voluum session generated successfully.",
      data: [await response.json()],
    },
    { status: 200 }
  );
};
