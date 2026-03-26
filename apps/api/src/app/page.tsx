import { getApiDocs } from "@/lib/swagger";
import Swagger from "@/components/swagger-ui";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <main>
      <Swagger spec={spec} />
    </main>
  );
}
