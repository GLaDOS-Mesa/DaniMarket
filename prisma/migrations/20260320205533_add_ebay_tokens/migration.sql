-- CreateTable
CREATE TABLE "ebay_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "access_token_expires_at" TIMESTAMP(3) NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "refresh_token_expires_at" TIMESTAMP(3) NOT NULL,
    "ebay_username" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ebay_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ebay_tokens_user_id_key" ON "ebay_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "ebay_tokens" ADD CONSTRAINT "ebay_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
