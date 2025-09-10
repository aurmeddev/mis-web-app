import { query } from "@/database/dbConnection";
import { DomainManagerServerService } from "@/lib/features/domains/DomainManagerServerService";
import { UpdateDomainManagerServiceProps } from "@/lib/features/domains/type/DomainManagerServiceProps";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { NextResponse, NextRequest } from "next/server";
export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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

  const domainId = `${(await params).id}`;
  let validatePayload: any;
  try {
    validatePayload = await request.json();
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
  const { domain_name }: UpdateDomainManagerServiceProps = validatePayload;
  if (!domain_name) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Domain name is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

  // Validate if the domain_name already exists
  const domain = new DomainManagerServerService();
  const customSearchParams = new URLSearchParams();
  customSearchParams.set("method", "find-one");
  const validationResponse = await domain.find({
    searchKeyword: "validation",
    requestUrlSearchParams: customSearchParams,
    payload: { domain_name },
  });

  if (!validationResponse.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Validation error occurred.",
        data: [],
      },
      { status: 400 }
    );
  }
  const doesApProfileExist = validationResponse.data.length > 0;
  if (doesApProfileExist) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: `The ${domain_name} already exists. Please check the domain name and try again.`,
        data: [],
      },
      { status: 409 }
    );
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
    domain_name,
    id: domainId,
  });
  const queryString = `UPDATE Domains ${columns} ${whereClause}`;
  console.log(queryString);
  console.log(values);

  // Execute the query to insert data into the database
  try {
    await query({
      query: queryString,
      values: values,
    });

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Domain have been updated successfully.",
        data: [{ domain_name }],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      },
      { status: 500 }
    );
  }
};
