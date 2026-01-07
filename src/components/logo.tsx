import Link from "next/link";
import Image from "next/image";

export function LogoPrimary() {
  return (
    <Link className="flex items-center gap-2 self-center font-medium" href="/">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Image
          alt="Inflow Logo"
          height={50}
          priority
          src={"/assets/inflow-primary-heavydark.svg"}
          width={50}
        />
      </div>
      Inflow
    </Link>
  );
}

export function LogoThirdVariantWithName() {
  return (
    <Link className="flex items-center gap-2 self-center font-medium" href="/">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Image
          alt="Inflow Logo"
          height={50}
          priority
          src={"/assets/inflow-secondary-lightdark.svg"}
          width={50}
        />
      </div>
      Inflow
    </Link>
  );
}

export function LogoThirdVariantWithoutName() {
  return (
    <Link className="flex items-center gap-2 self-center font-medium" href="/">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Image
          alt="Inflow Logo"
          height={50}
          priority
          src={"/assets/inflow-secondary-lightdark.svg"}
          width={50}
        />
      </div>
    </Link>
  );
}
