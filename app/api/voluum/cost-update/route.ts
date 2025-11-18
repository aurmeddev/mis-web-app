import { UpdateCostProps } from "@/lib/features/ads-manager/voluum/type/VoluumApiProps";
import { VoluumApiServerService } from "@/lib/features/ads-manager/voluum/VoluumApiServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
export const POST = async (request: NextRequest) => {
  // Check if the user session is valid before processing the request
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Session expired or invalid",
      },
      { status: 403 }
    );
  }

  const payload: Omit<UpdateCostProps, "sessionToken"> = await request.json();
  const { spend, v_campaign_id, date_from, date_to } = payload;
  if (typeof spend !== "number" || spend <= 0) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid spend value. It must be greater than 0.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (!v_campaign_id) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Voluum campaign id is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (!date_from) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Date from is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (!date_to) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Date to is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

  const voluumApi = new VoluumApiServerService();
  const authVoluum = await voluumApi.getSessionToken();
  const sessionToken: string = authVoluum.data[0].token || "";
  if (!authVoluum.isSuccess) {
    console.error("Voluum session error", authVoluum.message);
    return NextResponse.json(
      {
        isSuccess: false,
        message: authVoluum.message,
        data: [],
      },
      { status: 400 }
    );
  }

  const { isSuccess, data, message } = await voluumApi.updateCost({
    spend,
    v_campaign_id,
    date_from,
    date_to,
    sessionToken,
  });

  return NextResponse.json(
    {
      isSuccess,
      message,
      data,
    },
    { status: isSuccess ? 201 : 400 }
  );
};
