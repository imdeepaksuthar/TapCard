import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { gstNo } = await request.json();

    if (!gstNo || gstNo.length !== 15) {
      return NextResponse.json(
        { error: 'Invalid GST Number format' },
        { status: 400 }
      );
    }

    // Simulate network delay for verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock Response mimicking official GST API structure
    return NextResponse.json({
      success: true,
      data: {
        gstin: gstNo,
        legal_name: 'M/S DEMO TECHNOLOGIES PRIVATE LIMITED',
        trade_name: 'DEMO TECH',
        status: 'Active',
        taxpayer_type: 'Regular',
        registration_date: '12/04/2018',
        principal_place_of_business: '123, Tech Park Phase 2, Electronic City, Bangalore, Karnataka, 560100',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify GST' },
      { status: 500 }
    );
  }
}
