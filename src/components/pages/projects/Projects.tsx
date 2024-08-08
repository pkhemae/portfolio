import { Card, CardHeader, CardBody, CardFooter, Link, Image } from "@nextui-org/react";

export default function Projects() {
  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 justify-center">
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="https://i.pinimg.com/736x/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.jpg"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md">portfolio</p>
              <p className="text-small text-default-500">pkhemae/portfolio</p>
            </div>
          </CardHeader>
          <CardBody>
            <p>Site portfolio personnel développé en React avec TailwindCSS visant à me présenter moi et mes projets</p>
          </CardBody>
          <CardFooter>
            <Link
              isExternal
              showAnchorIcon
              href="https://github.com/pkhemae/portfolio"
            >
              Voir le code source sur GitHub.
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
