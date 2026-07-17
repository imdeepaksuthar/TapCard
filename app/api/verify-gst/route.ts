import { NextResponse } from 'next/server';

// Maps the first two digits of a GSTIN to the issuing state / UT.
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

// The 4th character of the embedded PAN encodes the entity type.
const PAN_ENTITY_TYPE: Record<string, string> = {
  P: 'Individual / Proprietor', C: 'Company', H: 'Hindu Undivided Family (HUF)',
  F: 'Firm / LLP', A: 'Association of Persons (AOP)', T: 'Trust',
  B: 'Body of Individuals (BOI)', L: 'Local Authority', J: 'Artificial Juridical Person',
  G: 'Government',
};

// IMPORTANT: This endpoint performs a STRUCTURAL FORMAT CHECK ONLY. It reads
// facts that are encoded inside the GSTIN itself (state code + embedded PAN) and
// does NOT contact the government GSTN portal. It therefore cannot confirm that
// a business is registered, active, or that the name matches. The response must
// never be presented to users as an official "verification". To offer real
// verification, integrate a government-authorised GSTIN API here and return its
// actual fields (legal name, status, registration date, principal place).
export async function POST(request: Request) {
  try {
    const { gstNo } = await request.json();
    const normalizedGst = (gstNo || '').trim().toUpperCase();

    // 2 digits, 5 letters, 4 digits, 1 letter, 1 alnum, 'Z', 1 alnum.
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(normalizedGst)) {
      return NextResponse.json(
        { success: false, error: 'Invalid GST number format. A valid GSTIN has 15 characters (e.g. 08GROPS2567D1Z8).' },
        { status: 400 }
      );
    }

    const stateCode = normalizedGst.substring(0, 2);
    const pan = normalizedGst.substring(2, 12);
    const entityChar = pan.charAt(3);

    return NextResponse.json({
      success: true,
      // Explicit: the number is well-formed, but it was NOT checked against GSTN.
      verified: false,
      format_valid: true,
      data: {
        gstin: normalizedGst,
        pan,
        state: STATE_CODES[stateCode] || 'Unknown',
        entity_type: PAN_ENTITY_TYPE[entityChar] || 'Unknown',
        note: 'Format check only — not verified against government (GSTN) records.',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process GST number.' },
      { status: 500 }
    );
  }
}
