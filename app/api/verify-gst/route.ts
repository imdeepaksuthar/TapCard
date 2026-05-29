import { NextResponse } from 'next/server';

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
  '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh'
};

export async function POST(request: Request) {
  try {
    const { gstNo } = await request.json();

    const normalizedGst = (gstNo || '').trim().toUpperCase();

    // Indian GSTIN regex: 2 digits, 5 letters, 4 digits, 1 letter, 1 digit, 1 letter (usually Z), 1 alphanumeric/digit
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(normalizedGst)) {
      return NextResponse.json(
        { error: 'Invalid GST Number format. A valid GSTIN contains 15 alphanumeric characters (e.g. 08GROPS2567D1Z8).' },
        { status: 400 }
      );
    }

    // Simulate network delay for verification
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const stateCode = normalizedGst.substring(0, 2);
    const pan = normalizedGst.substring(2, 12);
    const panType = pan.charAt(3);
    const businessIdentifier = pan.substring(0, 5); // e.g. GROPS

    const stateName = STATE_CODES[stateCode] || 'Karnataka';
    
    // Generate dynamic names based on PAN and taxpayer type
    let legalName = '';
    let tradeName = '';
    let taxpayerType = 'Regular';

    if (panType === 'C') {
      legalName = `M/S ${businessIdentifier} TECHNOLOGIES PRIVATE LIMITED (Mocked Integration)`;
      tradeName = `${businessIdentifier} TECH`;
      taxpayerType = 'Regular';
    } else if (panType === 'P') {
      legalName = `${businessIdentifier} ENTERPRISES (Mocked Integration)`;
      tradeName = `${businessIdentifier} STORES`;
      taxpayerType = 'Composition';
    } else if (panType === 'F') {
      legalName = `M/S ${businessIdentifier} & SONS PARTNERSHIP (Mocked Integration)`;
      tradeName = `${businessIdentifier} CO`;
      taxpayerType = 'Regular';
    } else {
      legalName = `M/S ${businessIdentifier} BUSINESS SOLUTIONS (Mocked Integration)`;
      tradeName = `${businessIdentifier} SOLUTIONS`;
      taxpayerType = 'Regular';
    }

    return NextResponse.json({
      success: true,
      data: {
        gstin: normalizedGst,
        legal_name: legalName,
        trade_name: tradeName,
        status: 'Active',
        taxpayer_type: taxpayerType,
        registration_date: '15/06/2021',
        principal_place_of_business: `Shop No. 42, ${businessIdentifier} Plaza, Main Sector Road, ${stateName}, India`,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify GST' },
      { status: 500 }
    );
  }
}
