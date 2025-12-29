import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { CanvasData, Shape } from "@/types";

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.user!.userId;

  const {
    title,
    data,
    boardId,
    thumbnailUrl,
  }: {
    title: string;
    data: CanvasData;
    boardId: string;
    thumbnailUrl?: string;
  } = await req.json();

  if (!boardId) {
    return NextResponse.json(
      { error: "boardId is required" },
      { status: 400 }
    );
  }

  // Extract main image
  const image =
    typeof data.uploadedImageBase64 === "string" &&
    data.uploadedImageBase64.startsWith("data:image/")
      ? data.uploadedImageBase64
      : null;

  // ✅ sanitize + serialize to JSON-safe structure
  const sanitizedData = {
    ...data,
    uploadedImageBase64: null,
    shapes: (data.shapes ?? []).map((shape: Shape) => {
      const { ...rest } = shape;
      return {
        ...rest,
        imageBase64:
          typeof shape.imageBase64 === "string" &&
          shape.imageBase64.startsWith("data:image/")
            ? shape.imageBase64
            : null,
      };
    }),
  };

  // ✅ CRITICAL FIX: force JSON value
  const jsonData = JSON.parse(JSON.stringify(sanitizedData));

  const design = await prisma.design.create({
    data: {
      title,
      data: jsonData,
      image,
      thumbnailUrl,
      ownerId: userId,
      boardId,
    },
  });

  return NextResponse.json(design, { status: 201 });
}
