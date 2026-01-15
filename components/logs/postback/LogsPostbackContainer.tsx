import LogPostbackManager from "./LogsPostbackManager";

export default function LogsPostbackContainer() {
  return (
    <>
      <section className="py-16">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold xl:text-4xl">
                Export Postback Log Issue
              </h2>
              <p className="text-muted-foreground text-md xl:text-lg">
                Generate and download a CSV file of your recent postback
                activity to verify tracking accuracy.
              </p>
            </div>

            <LogPostbackManager />
          </div>
        </div>
      </section>
    </>
  );
}
