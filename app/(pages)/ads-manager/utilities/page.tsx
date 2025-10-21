import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NotFound } from "@/components/not-found/not-found";
import { BrandsClientService } from "@/lib/features/brands/BrandsClientService";
import { GeosClientService } from "@/lib/features/geos/GeosClientService";
import { MediaBuyersClientService } from "@/lib/features/media-buyers/MediaBuyersClientService";
import { UtilitiesContainer } from "@/components/ads-manager/utilities/UtilitiesContainer";
export default async function Page({ searchParams }: any) {
  const session = await getSession();
  const awaitedParams = await searchParams;

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };
  if (!session) return <NotFound param={notFoundObj} />;

  const page = Number(awaitedParams.page) || 1;
  const limit = Number(awaitedParams.limit) || 10;
  const recruiter = awaitedParams.recruiter || "";
  const status = awaitedParams.status || "";
  const date_from = awaitedParams.dateFrom || "";
  const date_to = awaitedParams.dateTo || "";
  const params = {
    date_from,
    date_to,
    page,
    limit,
    recruiter,
    status,
  };

  const brandsApi = new BrandsClientService();
  const brands = await brandsApi.getAll({
    status: "active",
  }); // Get all the active brands

  const geosApi = new GeosClientService();
  const geos = await geosApi.getAll({ status: "active" }); // Get all the active geos

  const mediaBuyerApi = new MediaBuyersClientService();
  const mediaBuyers = await mediaBuyerApi.getAll({ status: "active" }); // Get all the active media buyers

  const formattedBrands = brands.data.map((brand) => ({
    id: brand.id,
    label: brand.brand_name,
    value: brand.brand_name,
  }));

  const formattedGeos = geos.data.map((geo) => ({
    id: geo.id,
    label: geo.geo_name,
    value: geo.geo_abbrev,
  }));

  const formattedMediaBuyers = mediaBuyers.data.map((mb) => ({
    id: mb.id,
    label: mb.name,
    value: mb.name,
  }));

  return (
    <div className="min-h-[calc(100dvh-7rem)]">
      <UtilitiesContainer
        brands={formattedBrands}
        geos={formattedGeos}
        mediaBuyers={formattedMediaBuyers}
      />
    </div>
  );
}
