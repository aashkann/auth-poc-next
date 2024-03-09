import { redirect } from "next/navigation";
import { getSession, login, logout } from "@/lib";

export default async function Page() {
  const session = await getSession();
  return (
    <section>
      <form
        action={async () => {
          "use server";
          await login();
          redirect("/");
        }}
      >
        <br />
        <button type="submit">Login with Speckle</button>
      </form>
      <form
        action={async () => {
          "use server";
          await logout();
          redirect("/");
        }}
      >
        <button type="submit">Logout</button>
      </form>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </section>
  );
}
