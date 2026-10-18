/**
 * Real DOCX Document Generator for OMNI-SWARM using the "docx" npm library
 * Generates verified digital records in .docx format with:
 * - White page layout, navy headings (#0B2A5B), teal accents (#0F766E)
 * - Header with OMNI-SWARM name, footer with page numbers and document ID
 * - Ordered sections: Summary table, What was done, Verification performed, Credential details, Boxed Signature area with QR code, Appendix
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  HeadingLevel,
  AlignmentType,
  ImageRun
} from 'docx';
import QRCode from 'qrcode';
import { VerifiableCredential, AuditEvent } from '../types';

// Theme Colors
const COLOR_NAVY = '0B2A5B';
const COLOR_TEAL = '0F766E';
const COLOR_GRAY_SURFACE = 'F8FAFC';
const COLOR_BORDER = 'CBD5E1';
const COLOR_MUTED = '64748B';
const COLOR_BLACK = '1E293B';

export interface DocxParams {
  documentId: string;
  workflowId: string;
  workflowType: string;
  issuedTo: string;
  languageUsed: string;
  timestamp: string; // ISO
  whatWasDone: {
    requestPrompt: string;
    resultSummary: string;
    extraDetails?: string;
  };
  verifications: Array<{
    checkName: string;
    result: 'Passed' | 'Failed';
    timestamp: string;
  }>;
  credential: VerifiableCredential;
  documentHash: string;
  signatureHex: string;
  issuerDid: string;
  handwrittenSignature?: string;
}

export async function generateOmniSwarmDocx(params: DocxParams): Promise<Blob> {
  const {
    documentId,
    workflowId,
    workflowType,
    issuedTo,
    languageUsed,
    timestamp,
    whatWasDone,
    verifications,
    credential,
    documentHash,
    signatureHex,
    issuerDid,
    handwrittenSignature
  } = params;

  // Format date in IST
  const dateObj = new Date(timestamp);
  const istDateStr = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  const isoDateStr = dateObj.toISOString();

  // Generate QR Code PNG Buffer for verification link
  const targetVerifyId = credential?.id || documentId;
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://omniswarm.internal'}/verify?id=${encodeURIComponent(targetVerifyId)}`;
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#0B2A5B', light: '#FFFFFF' }
    });
  } catch (err) {
    console.warn('QR code generation notice:', err);
  }

  // Convert base64 data URL to ArrayBuffer for docx ImageRun
  let qrImageRun: ImageRun | null = null;
  if (qrCodeDataUrl) {
    const base64Data = qrCodeDataUrl.split(',')[1];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    qrImageRun = new ImageRun({
      data: bytes.buffer,
      transformation: {
        width: 110,
        height: 110
      }
    });
  }

  // Convert base64 handwritten signature to ArrayBuffer for docx ImageRun
  let signatureImageRun: ImageRun | null = null;
  const signatureDataUrl = handwrittenSignature || credential?.subject?.handwrittenSignature;
  if (signatureDataUrl && typeof signatureDataUrl === 'string' && signatureDataUrl.startsWith('data:image')) {
    try {
      const base64Sig = signatureDataUrl.split(',')[1];
      const binarySig = atob(base64Sig);
      const sigBytes = new Uint8Array(binarySig.length);
      for (let i = 0; i < binarySig.length; i++) {
        sigBytes[i] = binarySig.charCodeAt(i);
      }
      signatureImageRun = new ImageRun({
        data: sigBytes.buffer,
        transformation: {
          width: 140,
          height: 55
        }
      });
    } catch (err) {
      console.warn('Handwritten signature ImageRun conversion notice:', err);
    }
  }

  // Table styling helper
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    left: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER },
    right: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BORDER }
  };

  const headerCell = (text: string, widthPercent: number = 30) =>
    new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: { fill: COLOR_GRAY_SURFACE },
      borders: cellBorder,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: true,
              color: COLOR_NAVY,
              size: 20
            })
          ]
        })
      ]
    });

  const valueCell = (text: string, widthPercent: number = 70) =>
    new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      borders: cellBorder,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              color: COLOR_BLACK,
              size: 20
            })
          ]
        })
      ]
    });

  // Section 2: Summary Table
  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('Document ID'), valueCell(documentId)] }),
      new TableRow({ children: [headerCell('Workflow ID'), valueCell(workflowId)] }),
      new TableRow({ children: [headerCell('Issued To'), valueCell(issuedTo)] }),
      new TableRow({ children: [headerCell('Language Used'), valueCell(languageUsed)] }),
      new TableRow({ children: [headerCell('Date & Time'), valueCell(`${isoDateStr} (${istDateStr})`)] }),
      new TableRow({ children: [headerCell('Workflow Type'), valueCell(workflowType)] })
    ]
  });

  // Section 4: Verification Table
  const verificationRows = [
    new TableRow({
      children: [
        headerCell('Check / Verification Gate', 50),
        headerCell('Result', 20),
        headerCell('Timestamp (UTC)', 30)
      ]
    }),
    ...verifications.map(
      v =>
        new TableRow({
          children: [
            valueCell(v.checkName, 50),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              borders: cellBorder,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: v.result,
                      bold: true,
                      color: v.result === 'Passed' ? COLOR_TEAL : 'DC2626',
                      size: 20
                    })
                  ]
                })
              ]
            }),
            valueCell(v.timestamp, 30)
          ]
        })
    )
  ];

  const verificationTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: verificationRows
  });

  // Section 5: Credential Details Table
  const credentialTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell('Credential Type'), valueCell(credential.type.join(', '))] }),
      new TableRow({ children: [headerCell('Issuer DID'), valueCell(credential.issuer_did)] }),
      new TableRow({ children: [headerCell('Subject ID'), valueCell(credential.subject.id)] }),
      new TableRow({ children: [headerCell('Issuance Date'), valueCell(credential.issuance_date)] }),
      new TableRow({
        children: [
          headerCell('Status'),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: cellBorder,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: credential.status,
                    bold: true,
                    color: credential.status === 'Active' ? COLOR_TEAL : 'DC2626',
                    size: 20
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Section 6: Boxed Signature Area
  const signatureShort = signatureHex.length > 32 ? signatureHex.slice(0, 32) + '...' : signatureHex;

  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: cellBorder,
            shading: { fill: COLOR_GRAY_SURFACE },
            children: [
              ...(signatureImageRun
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Signer Handwritten Signature / Seal:', bold: true, color: COLOR_NAVY, size: 20 })
                      ]
                    }),
                    new Paragraph({
                      children: [signatureImageRun]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Cryptographic Attestation & Authority Seal:', bold: true, color: COLOR_NAVY, size: 20 })
                      ]
                    })
                  ]
                : []),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Digitally signed by: ', bold: true, color: COLOR_NAVY, size: 22 }),
                  new TextRun({ text: 'OMNI-SWARM Issuer Node', bold: true, color: COLOR_TEAL, size: 22 })
                ]
              }),
              new Paragraph({ children: [new TextRun({ text: `Issuer DID: ${issuerDid}`, size: 18, color: COLOR_MUTED })] }),
              new Paragraph({ children: [new TextRun({ text: `Signing Timestamp: ${isoDateStr}`, size: 18, color: COLOR_MUTED })] }),
              new Paragraph({ children: [new TextRun({ text: 'Algorithm: Ed25519 over SHA-256 (RFC 8785 Canonical)', size: 18, color: COLOR_MUTED })] }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Document SHA-256 Hash: ', bold: true, size: 18, color: COLOR_NAVY }),
                  new TextRun({ text: documentHash, size: 16, font: 'Courier New', color: COLOR_BLACK })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Signature: ', bold: true, size: 18, color: COLOR_NAVY }),
                  new TextRun({ text: signatureShort, size: 16, font: 'Courier New', color: COLOR_BLACK }),
                  new TextRun({ text: ' (full signature in Appendix)', size: 16, color: COLOR_MUTED, italics: true })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: cellBorder,
            alignment: AlignmentType.CENTER,
            children: [
              ...(qrImageRun ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [qrImageRun] })] : []),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Scan to Verify Record',
                    size: 16,
                    bold: true,
                    color: COLOR_NAVY
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Any alteration to content invalidates digital signature.',
                    size: 14,
                    color: COLOR_MUTED,
                    italics: true
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Construct Full Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'OMNI-SWARM • Sovereign Multi-Agent Platform',
                    color: COLOR_TEAL,
                    size: 18,
                    bold: true
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `Record ID: ${documentId} | Page `, size: 16, color: COLOR_MUTED }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLOR_MUTED }),
                  new TextRun({ text: ' of ', size: 16, color: COLOR_MUTED }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: COLOR_MUTED })
                ]
              })
            ]
          })
        },
        children: [
          // 1. Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: 'Verified Digital Record',
                bold: true,
                color: COLOR_NAVY,
                size: 36
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Cryptographically sealed verifiable account of citizen assistance and autonomous workflow execution.',
                color: COLOR_MUTED,
                size: 20
              })
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),

          // 2. Summary Table
          summaryTable,
          new Paragraph({ children: [new TextRun({ text: '' })] }),

          // 3. What Was Done
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: 'What Was Done',
                bold: true,
                color: COLOR_NAVY,
                size: 26
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Citizen Request (PII Redacted): ', bold: true, color: COLOR_TEAL, size: 20 }),
              new TextRun({ text: whatWasDone.requestPrompt, size: 20, color: COLOR_BLACK })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Action & Delivered Result: ', bold: true, color: COLOR_TEAL, size: 20 }),
              new TextRun({ text: whatWasDone.resultSummary, size: 20, color: COLOR_BLACK })
            ]
          }),
          ...(whatWasDone.extraDetails
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Workflow Execution Notes: ', bold: true, color: COLOR_TEAL, size: 20 }),
                    new TextRun({ text: whatWasDone.extraDetails, size: 20, color: COLOR_BLACK })
                  ]
                })
              ]
            : []),
          new Paragraph({ children: [new TextRun({ text: '' })] }),

          // 4. Verification Performed
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: 'Verification Performed',
                bold: true,
                color: COLOR_NAVY,
                size: 26
              })
            ]
          }),
          verificationTable,
          new Paragraph({ children: [new TextRun({ text: '' })] }),

          // 5. Credential Details
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: 'Verifiable Credential Details',
                bold: true,
                color: COLOR_NAVY,
                size: 26
              })
            ]
          }),
          credentialTable,
          new Paragraph({ children: [new TextRun({ text: '' })] }),

          // 6. Signature Area
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: 'Cryptographic Signature & Attestation',
                bold: true,
                color: COLOR_NAVY,
                size: 26
              })
            ]
          }),
          signatureTable,
          new Paragraph({ children: [new TextRun({ text: '' })] }),

          // Honest Note
          new Paragraph({
            children: [
              new TextRun({
                text: 'Notice on Document Integrity: ',
                bold: true,
                size: 18,
                color: COLOR_NAVY
              }),
              new TextRun({
                text: 'The digital signature covers the recorded canonical content above. If someone edits this Word file, verification against the stored record at the link will still display the original tamper-proof data.',
                size: 18,
                color: COLOR_MUTED,
                italics: true
              })
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),

          // 7. Appendix
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: 'Appendix: Full Verifiable Credential JSON-LD & Raw Signature',
                bold: true,
                color: COLOR_NAVY,
                size: 24
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Full Ed25519 Signature (Hex):', bold: true, color: COLOR_TEAL, size: 18 })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: signatureHex,
                font: 'Courier New',
                size: 16,
                color: COLOR_BLACK
              })
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: '' })] }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Canonical Verifiable Credential JSON-LD:', bold: true, color: COLOR_TEAL, size: 18 })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: JSON.stringify(credential.credential_json || credential, null, 2),
                font: 'Courier New',
                size: 16,
                color: COLOR_BLACK
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers standard browser download for a .docx blob
 */
export function downloadDocxBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
