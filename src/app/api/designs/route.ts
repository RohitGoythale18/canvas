import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const auth = authenticateRequest(req);

    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user!.userId;
    const { title, data, boardId, thumbnailUrl } = await req.json();

    // Extract image from data if present
    const image = data.uploadedImageBase64 && typeof data.uploadedImageBase64 === "string" &&
                  data.uploadedImageBase64.startsWith("data:image/")
                  ? data.uploadedImageBase64 : null;

    const sanitizedData = {
        ...data,

        // Remove uploadedImageBase64 from data since it's now stored separately
        uploadedImageBase64: null,

        // ✅ Shape images (Base64 strings)
        shapes: (data.shapes || []).map((shape: any) => {
            const { imageElement, ...rest } = shape;
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

    const design = await prisma.design.create({
        data: {
            title,
            data: sanitizedData,
            image,
            thumbnailUrl,
            boardId,
            ownerId: userId,
        },
    });

    return NextResponse.json(design, { status: 201 });
}
