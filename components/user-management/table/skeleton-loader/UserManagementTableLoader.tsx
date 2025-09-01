export function UserManagementTableLoader() {
  return (
    <div className="mt-4">
      <div className="flex w-[40%] gap-2">
        <div className="bg-muted h-7 rounded w-[45%]"></div>
        <div className="bg-muted h-7 rounded w-full"></div>
      </div>
      <table className="min-w-full border-separate border-spacing-y-2 mt-2">
        <thead>
          <tr>
            <th className="text-left w-[3%]">
              <div className="bg-muted h-8 rounded"></div>
            </th>
            <th className="text-left w-[20%]">
              <div className="bg-muted h-8 rounded w-full"></div>
            </th>
            <th className="text-left w-[20%]">
              <div className="bg-muted h-8 rounded w-full"></div>
            </th>
            <th className="text-left w-[10%]">
              <div className="bg-muted h-8 rounded w-full"></div>
            </th>
            <th className="text-left w-[10%]">
              <div className="bg-muted h-8 rounded w-full"></div>
            </th>
            <th className="text-left w-[5%]">
              <div className="bg-muted h-8 rounded w-full"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              <td className="w-[3%]">
                <div className="bg-muted h-8 rounded w-full"></div>
              </td>
              <td className="w-[20%]">
                <div className="bg-muted h-8 rounded w-full"></div>
              </td>
              <td className="w-[20%]">
                <div className="bg-muted h-8 rounded w-full"></div>
              </td>
              <td className="w-[10%]">
                <div className="bg-muted h-8 rounded w-full"></div>
              </td>
              <td className="w-[10%]">
                <div className="bg-muted h-8 rounded w-full"></div>
              </td>
              <td className="w-[5%]">
                <div className="bg-muted h-8 rounded w-full"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
