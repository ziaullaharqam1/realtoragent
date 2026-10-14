import pptxgen from 'pptxgenjs';
import { Property, ClientBrief } from '../types';

export async function exportPropertyPitchDeck(property: Property, clientBrief?: ClientBrief) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'PropPilot Pro';
  pres.company = 'PropPilot Private Client Group';
  pres.title = `${property.title} - VIP Investor Presentation`;

  // Colors
  const DARK_BG = '080C14';
  const GOLD = 'D97706';
  const LIGHT_GOLD = 'F59E0B';
  const TEXT_WHITE = 'F8FAFC';
  const TEXT_MUTED = '94A3B8';
  const SLATE_CARD = '0F172A';

  // --- SLIDE 1: Title & Hero Showcase ---
  const slide1 = pres.addSlide();
  slide1.background = { color: DARK_BG };

  slide1.addText('PROPPILOT PRIVATE CLIENT GROUP · EXCLUSIVE INVENTORY', {
    x: 1.0,
    y: 0.8,
    w: 11.3,
    h: 0.4,
    fontSize: 10,
    bold: true,
    color: GOLD,
    fontFace: 'Outfit',
  });

  slide1.addText(property.title.toUpperCase(), {
    x: 1.0,
    y: 1.2,
    w: 11.3,
    h: 1.2,
    fontSize: 34,
    bold: true,
    color: TEXT_WHITE,
    fontFace: 'Outfit',
  });

  slide1.addText(property.subtitle, {
    x: 1.0,
    y: 2.3,
    w: 11.3,
    h: 0.6,
    fontSize: 15,
    color: TEXT_MUTED,
    fontFace: 'Manrope',
  });

  // Price & Specs Callout Box
  slide1.addShape(pres.ShapeType.rect, {
    x: 1.0,
    y: 3.2,
    w: 11.3,
    h: 2.2,
    fill: { color: SLATE_CARD },
    line: { color: GOLD, width: 1 },
  });

  slide1.addText('OFFERING VALUATION', {
    x: 1.4,
    y: 3.4,
    w: 3.5,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: GOLD,
  });

  slide1.addText(`AED ${(property.priceAED / 1000000).toFixed(1)}M`, {
    x: 1.4,
    y: 3.7,
    w: 3.5,
    h: 0.7,
    fontSize: 26,
    bold: true,
    color: TEXT_WHITE,
  });

  slide1.addText(`(Approx. USD $${(property.priceUSD / 1000000).toFixed(2)}M)`, {
    x: 1.4,
    y: 4.4,
    w: 3.5,
    h: 0.3,
    fontSize: 11,
    color: TEXT_MUTED,
  });

  // Specs Columns
  slide1.addText(`BEDROOMS: ${property.bedrooms} SUITES\nBATHROOMS: ${property.bathrooms}\nBUILT-UP: ${property.sqft.toLocaleString()} SQ.FT (${property.sqm} M²)`, {
    x: 5.2,
    y: 3.6,
    w: 3.8,
    h: 1.4,
    fontSize: 12,
    bold: true,
    color: TEXT_WHITE,
    lineSpacing: 22,
  });

  slide1.addText(`NET RENTAL YIELD: ${property.rentalYield}%\nCAPITAL APPRECIATION: ${property.capitalAppreciation}%\nHANDOVER: ${property.completionDate}\nUAE 10-YR GOLDEN VISA ELIGIBLE`, {
    x: 8.8,
    y: 3.6,
    w: 3.3,
    h: 1.4,
    fontSize: 11,
    bold: true,
    color: LIGHT_GOLD,
    lineSpacing: 20,
  });

  // Prepared for Client Footer
  const clientName = clientBrief?.clientName || 'Private Investor';
  slide1.addText(`CONFIDENTIAL FOR: ${clientName.toUpperCase()} · BROKER: MARCUS STERLING (admin@proppilot.demo)`, {
    x: 1.0,
    y: 6.6,
    w: 11.3,
    h: 0.4,
    fontSize: 9,
    color: TEXT_MUTED,
  });

  // --- SLIDE 2: Architectural & 3D Telemetry Highlights ---
  const slide2 = pres.addSlide();
  slide2.background = { color: DARK_BG };

  slide2.addText('ARCHITECTURAL EXCELLENCE & 3D VIRTUAL TOUR HIGHLIGHTS', {
    x: 1.0,
    y: 0.8,
    w: 11.3,
    h: 0.4,
    fontSize: 10,
    bold: true,
    color: GOLD,
    fontFace: 'Outfit',
  });

  slide2.addText('Irreplaceable Trophy Engineering', {
    x: 1.0,
    y: 1.2,
    w: 11.3,
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: TEXT_WHITE,
    fontFace: 'Outfit',
  });

  // Key USPs in Slide 2
  property.keyUSPs.forEach((usp, idx) => {
    slide2.addShape(pres.ShapeType.rect, {
      x: 1.0,
      y: 2.2 + idx * 0.9,
      w: 11.3,
      h: 0.75,
      fill: { color: SLATE_CARD },
      line: { color: '1E293B', width: 1 },
    });

    slide2.addText(`0${idx + 1}`, {
      x: 1.2,
      y: 2.3 + idx * 0.9,
      w: 0.6,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: GOLD,
    });

    slide2.addText(usp, {
      x: 1.9,
      y: 2.35 + idx * 0.9,
      w: 10.2,
      h: 0.5,
      fontSize: 12,
      bold: false,
      color: TEXT_WHITE,
    });
  });

  // --- SLIDE 3: 3D Digital Twin Link & Next Steps ---
  const slide3 = pres.addSlide();
  slide3.background = { color: DARK_BG };

  slide3.addText('INTERACTIVE 3D DIGITAL TWIN & PRIVATE VIEWING', {
    x: 1.0,
    y: 0.8,
    w: 11.3,
    h: 0.4,
    fontSize: 10,
    bold: true,
    color: GOLD,
  });

  slide3.addText('Access Your Dedicated 3D Showroom', {
    x: 1.0,
    y: 1.2,
    w: 11.3,
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: TEXT_WHITE,
  });

  slide3.addShape(pres.ShapeType.rect, {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    h: 3.2,
    fill: { color: SLATE_CARD },
    line: { color: GOLD, width: 1 },
  });

  slide3.addText('EXCLUSIVE CLIENT 3D ACCESS LINK:', {
    x: 1.5,
    y: 2.6,
    w: 10.3,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: GOLD,
  });

  slide3.addText(`https://proppilot.vip/tour/${property.id}?client=${encodeURIComponent(clientName)}`, {
    x: 1.5,
    y: 3.0,
    w: 10.3,
    h: 0.5,
    fontSize: 14,
    bold: true,
    color: TEXT_WHITE,
  });

  slide3.addText('Experience includes:\n• Full 360° Dollhouse Floorplan & First-Person Room Walkthrough\n• Live Material Switcher (Calacatta Gold Marble vs French Oak)\n• Golden Hour Sunset & Twilight Solar Simulation\n• Verified Title Escrow via UAE RERA Registered Brokerage', {
    x: 1.5,
    y: 3.7,
    w: 10.3,
    h: 1.4,
    fontSize: 11,
    color: TEXT_MUTED,
    lineSpacing: 18,
  });

  slide3.addText('SCHEDULE PRIVATE IN-PERSON INSPECTION / ESCROW DEPOSIT:\nPropPilot Private Client Group · Desk: +971 4 800 PILOT · admin@proppilot.demo', {
    x: 1.0,
    y: 6.2,
    w: 11.3,
    h: 0.5,
    fontSize: 10,
    bold: true,
    color: GOLD,
  });

  // Save the PPTX file
  await pres.writeFile({ fileName: `${property.title.replace(/\s+/g, '_')}_Investor_Deck.pptx` });
}
