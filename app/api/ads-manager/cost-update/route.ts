import { CostUpdateManager } from "@/lib/features/ads-manager/cost-update/CostUpdateManager";
import { ICostUpdate } from "@/lib/features/ads-manager/cost-update/ICostUpdate";
import { VoluumCostUpdateServerApi } from "@/lib/features/ads-manager/cost-update/voluum/VoluumCostUpdateServerApi";
import { ExportManager } from "@/lib/features/ads-manager/export/ExportManager";
import { VoluumExportServerApi } from "@/lib/features/ads-manager/export/voluum/VoluumExportServerApi";
import { VoluumSessionServerApi } from "@/lib/features/ads-manager/voluum/session/VoluumSessionServerApi";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { addDays, format } from "date-fns";
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

  let payload: ICostUpdate;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      },
      { status: 400 }
    );
  }

  const { spend, date_from, date_to, campaign_id } = payload;
  if (!campaign_id) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "campaign_id is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (!spend || spend < 0 || typeof spend !== "number") {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid spend value.",
        data: [],
      },
      { status: 400 }
    );
  }

  const yesterday = {
    from: date_from || format(addDays(new Date(), -1), "yyyy-MM-dd"),
    to: date_to || format(addDays(new Date(), -1), "yyyy-MM-dd"),
  };

  const voluumSession = new VoluumSessionServerApi();
  const authVoluum = await voluumSession.generateToken();
  if (!authVoluum.isSuccess) {
    console.error("Voluum session error", authVoluum.message);
    return NextResponse.json(
      {
        isSuccess: false,
        message: authVoluum.message,
        data: [],
      },
      { status: 500 }
    );
  }

  const token: string = authVoluum.data[0].token;
  const exportApi = new ExportManager(new VoluumExportServerApi({ token }));
  const exportResponse = await exportApi.process({
    date_from: yesterday.from,
    date_to: yesterday.to,
    campaign_id,
  });

  if (!exportResponse.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: exportResponse.message,
        data: [],
      },
      { status: 500 }
    );
  }

  if (exportResponse.data.length === 0) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: exportResponse.message,
        data: [{ status: exportResponse.message }],
      },
      { status: 404 }
    );
  }

  const api = new CostUpdateManager(new VoluumCostUpdateServerApi({ token }));
  const { isSuccess, data, message } = await api.process({
    spend,
    date_from,
    date_to,
    campaign_id: exportResponse.data[0].campaign_id,
  });

  return NextResponse.json(
    {
      isSuccess,
      message: message,
      data: data,
    },
    { status: isSuccess ? 201 : 500 }
  );
};
