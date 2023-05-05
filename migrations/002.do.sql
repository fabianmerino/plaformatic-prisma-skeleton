-- CreateTable
CREATE TABLE "devices" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "osVersion" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;