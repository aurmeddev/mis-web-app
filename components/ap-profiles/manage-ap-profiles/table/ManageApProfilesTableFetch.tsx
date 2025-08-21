"use server";

import { ManageApProfilesTableContainer } from "./ManageApProfilesTableContainer";

export async function ManageApProfilesTableFetch() {
  const data = [
    {
      id: "1",
      profile_name: "PH-AP OXY 12345",
      fb_owner_name: "Marivic",
      username: "qwerty12345",
      password: "qwerty",
      long_2fa_key: "long_2fa_key_qwerty",
      recovery_codes: [
        {
          id: 1,
          recovery_code: "4134123",
        },
        {
          id: 2,
          recovery_code: "4124123",
        },
      ],
      marketing_api_access_token:
        "EAAUDWdxRbzoBPFMV32nCQouJOOx67fFfbQUtsIYZCeOMqIZBiHztaQBvgSuG5oHMsBzFtolfxPhgIRwmMcL9zZCpc2DEgRTokveOOIFeyIz4uX82aOZAYdsM7U1nnIRnX0tDUoz974cpF5ZBkgymlA4p1wZCVnCyFQYsoG3QiNzBZBNSbti72EnKBdo14xTbQpt",
      remarks: null,
      is_active: "2",
      created_by: {
        full_name: "Jason",
        team_name: "Alvin",
      },
      created_at: "2025-08-20 23:44:49",
    },
    {
      id: "2",
      profile_name: "PH-AP OXY 03434",
      fb_owner_name: "Justin Beefer",
      username: "username_test_2",
      password: "password_test_2",
      long_2fa_key: null,
      recovery_codes: [
        {
          id: 1,
          recovery_code: "4134123",
        },
        {
          id: 2,
          recovery_code: "4124123",
        },
      ],
      marketing_api_access_token: null,
      remarks: null,
      is_active: "2",
      created_by: {
        full_name: "Kevin",
        team_name: "Alvin",
      },
      created_at: "2025-08-20 23:45:35",
    },
    {
      id: "3",
      profile_name: "PH-AP OXY 03435",
      fb_owner_name: "Norman Dato",
      username: "username_test_3",
      password: "password_test_3",
      long_2fa_key: null,
      recovery_codes: [
        {
          id: 1,
          recovery_code: "4134123",
        },
        {
          id: 2,
          recovery_code: "4124123",
        },
      ],
      marketing_api_access_token: null,
      remarks: null,
      is_active: "2",
      created_by: {
        full_name: "Joel Jay",
        team_name: "Alvin",
      },
      created_at: "2025-08-20 23:46:30",
    },
    {
      id: "4",
      profile_name: "PH-AP OXY 03436",
      fb_owner_name: "Sprongklong",
      username: "username_test_4",
      password: "password_test_4",
      long_2fa_key: "long_2fa_key_test_4",
      recovery_codes: [
        {
          id: 1,
          recovery_code: "4134123",
        },
        {
          id: 2,
          recovery_code: "4124123",
        },
      ],
      marketing_api_access_token:
        "EAAUDWdxRbzoBPFMV32nCQouJOOx67fFfbQUtsIYZCeOMqIZBiHztaQBvgSuG5oHMsBzFtolfxPhgIRwmMcL9zZCpc2DEgRTokveOOIFeyIz4uX82aOZAYdsM7U1nnIRnX0tDUoz974cpF5ZBkgymlA4p1wZCVnCyFQYsoG3QiNzBZBNSbti72EnKBdo14xTbQpt",
      remarks: null,
      is_active: "2",
      created_by: {
        full_name: "Zach",
        team_name: "Alvin",
      },
      created_at: "2025-08-20 23:49:31",
    },
    {
      id: "5",
      profile_name: "PH-AP OXY 03437",
      fb_owner_name: "Nick Marino",
      username: "username_test_4",
      password: "password_test_4",
      long_2fa_key: "long_2fa_key_test_4",
      recovery_codes: [
        {
          id: 1,
          recovery_code: "4134123",
        },
        {
          id: 2,
          recovery_code: "4124123",
        },
      ],
      marketing_api_access_token:
        "EAAUDWdxRbzoBPFMV32nCQouJOOx67fFfbQUtsIYZCeOMqIZBiHztaQBvgSuG5oHMsBzFtolfxPhgIRwmMcL9zZCpc2DEgRTokveOOIFeyIz4uX82aOZAYdsM7U1nnIRnX0tDUoz974cpF5ZBkgymlA4p1wZCVnCyFQYsoG3QiNzBZBNSbti72EnKBdo14xTbQpt",
      remarks: null,
      is_active: "2",
      created_by: {
        full_name: "Jason",
        team_name: "Alvin",
      },
      created_at: "2025-08-21 12:56:38",
    },
    {
      id: "6",
      profile_name: "PH-AP OXY 03438",
      fb_owner_name: "Hugo Legas",
      username: "username_test_4",
      password: "password_test_4",
      long_2fa_key: "long_2fa_key_test_4",
      recovery_codes: [
        {
          id: 1,
          recovery_code: "4134123",
        },
        {
          id: 2,
          recovery_code: "4124123",
        },
      ],
      marketing_api_access_token:
        "EAAUDWdxRbzoBPFMV32nCQouJOOx67fFfbQUtsIYZCeOMqIZBiHztaQBvgSuG5oHMsBzFtolfxPhgIRwmMcL9zZCpc2DEgRTokveOOIFeyIz4uX82aOZAYdsM7U1nnIRnX0tDUoz974cpF5ZBkgymlA4p1wZCVnCyFQYsoG3QiNzBZBNSbti72EnKBdo14xTbQpt",
      remarks: null,
      is_active: "2",
      created_by: {
        full_name: "Jason",
        team_name: "Alvin",
      },
      created_at: "2025-08-21 12:57:37",
    },
  ];
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <ManageApProfilesTableContainer profiles={data} />;
}
