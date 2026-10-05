import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        machine: true,
        configuration: {
          include: {
            components: {
              include: { component: true, mountingPoint: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, quotes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      machineId,
      customerName,
      companyName,
      email,
      phone,
      country,
      message,
      configurationId,
      totalQuotedPrice,
      currency,
    } = body;

    // Generate RFQ number
    const count = await prisma.quote.count();
    const quoteNumber = `RFQ-2026-${String(count + 1).padStart(4, "0")}`;

    let finalConfigId = configurationId;

    // If configurationId was not pre-saved, create a draft configuration record
    if (!finalConfigId) {
      const draftConfig = await prisma.configuration.create({
        data: {
          name: `${customerName} - ${companyName} RFQ Setup`,
          machineId,
          totalPrice: parseFloat(totalQuotedPrice) || 0,
          currency: currency || "INR",
          status: "QUOTED",
        },
      });
      finalConfigId = draftConfig.id;
    }

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        configurationId: finalConfigId,
        machineId,
        customerName,
        companyName,
        email,
        phone,
        country: country || "India",
        message: message || "",
        status: "SUBMITTED",
        totalQuotedPrice: parseFloat(totalQuotedPrice) || 0,
        currency: currency || "INR",
      },
      include: { machine: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "SUBMIT_QUOTE",
        entityType: "Quote",
        entityId: quote.id,
        detailsJson: JSON.stringify({
          quoteNumber,
          customerName,
          companyName,
          total: quote.totalQuotedPrice,
        }),
      },
    });

    return NextResponse.json({ success: true, quote });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const quote = await prisma.quote.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_QUOTE_STATUS",
        entityType: "Quote",
        entityId: quote.id,
        detailsJson: JSON.stringify({ quoteNumber: quote.quoteNumber, newStatus: status }),
      },
    });

    return NextResponse.json({ success: true, quote });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
