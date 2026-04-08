#!/usr/bin/env python3
"""
TunePoa Platform Plan - Business Architecture & Technical Plan Document
Generates a comprehensive PDF document for the TunePoa ringback tone management platform.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    Paragraph, Spacer, PageBreak, Table, TableStyle,
    SimpleDocTemplate
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ==================== FONT REGISTRATION ====================
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ==================== COLOR SCHEME ====================
TABLE_HEADER_COLOR = colors.HexColor('#1F4E79')
TABLE_HEADER_TEXT = colors.white
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = colors.HexColor('#F5F5F5')
ACCENT_COLOR = colors.HexColor('#1F4E79')
LIGHT_ACCENT = colors.HexColor('#D6E4F0')

# ==================== STYLES ====================
cover_title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='Times New Roman',
    fontSize=36,
    leading=44,
    alignment=TA_CENTER,
    spaceAfter=12,
    textColor=ACCENT_COLOR,
)

cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='Times New Roman',
    fontSize=18,
    leading=26,
    alignment=TA_CENTER,
    spaceAfter=12,
    textColor=colors.HexColor('#333333'),
)

cover_info_style = ParagraphStyle(
    name='CoverInfo',
    fontName='Times New Roman',
    fontSize=14,
    leading=22,
    alignment=TA_CENTER,
    spaceAfter=8,
    textColor=colors.HexColor('#555555'),
)

h1_style = ParagraphStyle(
    name='Heading1',
    fontName='Times New Roman',
    fontSize=20,
    leading=28,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=12,
    textColor=ACCENT_COLOR,
)

h2_style = ParagraphStyle(
    name='Heading2',
    fontName='Times New Roman',
    fontSize=15,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=14,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6'),
)

h3_style = ParagraphStyle(
    name='Heading3',
    fontName='Times New Roman',
    fontSize=12,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=10,
    spaceAfter=6,
    textColor=colors.HexColor('#333333'),
)

body_style = ParagraphStyle(
    name='BodyText',
    fontName='Times New Roman',
    fontSize=10.5,
    leading=17,
    alignment=TA_JUSTIFY,
    spaceBefore=0,
    spaceAfter=6,
)

bullet_style = ParagraphStyle(
    name='BulletText',
    fontName='Times New Roman',
    fontSize=10.5,
    leading=17,
    alignment=TA_LEFT,
    leftIndent=20,
    spaceBefore=2,
    spaceAfter=2,
)

sub_bullet_style = ParagraphStyle(
    name='SubBulletText',
    fontName='Times New Roman',
    fontSize=10,
    leading=16,
    alignment=TA_LEFT,
    leftIndent=40,
    spaceBefore=1,
    spaceAfter=1,
)

toc_h1_style = ParagraphStyle(
    name='TOCHeading1',
    fontName='Times New Roman',
    fontSize=13,
    leading=20,
    leftIndent=20,
)

toc_h2_style = ParagraphStyle(
    name='TOCHeading2',
    fontName='Times New Roman',
    fontSize=11,
    leading=18,
    leftIndent=40,
)

toc_h3_style = ParagraphStyle(
    name='TOCHeading3',
    fontName='Times New Roman',
    fontSize=10,
    leading=16,
    leftIndent=60,
)

tbl_header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    textColor=colors.white,
    alignment=TA_CENTER,
)

tbl_cell_style = ParagraphStyle(
    name='TableCell',
    fontName='Times New Roman',
    fontSize=9.5,
    leading=14,
    textColor=colors.black,
    alignment=TA_LEFT,
)

tbl_cell_center = ParagraphStyle(
    name='TableCellCenter',
    fontName='Times New Roman',
    fontSize=9.5,
    leading=14,
    textColor=colors.black,
    alignment=TA_CENTER,
)

caption_style = ParagraphStyle(
    name='Caption',
    fontName='Times New Roman',
    fontSize=9,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#555555'),
    spaceBefore=3,
    spaceAfter=6,
)


# ==================== DOC TEMPLATE WITH TOC ====================
class TocDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)

    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            self.notify('TOCEntry', (level, text, self.page))


def add_heading(text, style, level=0):
    p = Paragraph(text, style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    return p


def make_table(data, col_widths, num_header_rows=1):
    """Create a styled table with standard color scheme."""
    t = Table(data, colWidths=col_widths)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, num_header_rows - 1), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, num_header_rows - 1), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(num_header_rows, len(data)):
        bg = TABLE_ROW_EVEN if (i - num_header_rows) % 2 == 0 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


def bp(text):
    """Body paragraph helper."""
    return Paragraph(text, body_style)


def bul(text):
    """Bullet point helper."""
    return Paragraph(text, bullet_style)


def sbul(text):
    """Sub-bullet helper."""
    return Paragraph(text, sub_bullet_style)


# ==================== BUILD DOCUMENT ====================
def build_pdf():
    output_path = '/home/z/my-project/download/TunePoa_Platform_Plan.pdf'

    doc = TocDocTemplate(
        output_path,
        pagesize=A4,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        leftMargin=2.2 * cm,
        rightMargin=2.2 * cm,
        title='TunePoa_Platform_Plan',
        author='Z.ai',
        creator='Z.ai',
        subject='Business Architecture and Technical Plan for the TunePoa Ringback Tone Management Platform',
    )

    story = []
    W = doc.width  # available width

    # ==================== COVER PAGE ====================
    story.append(Spacer(1, 100))
    story.append(Paragraph('<b>TunePoa</b>', cover_title_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph('<b>Business Architecture &<br/>Technical Plan</b>', cover_subtitle_style))
    story.append(Spacer(1, 36))

    # Decorative line
    line_data = [['']]
    line_table = Table(line_data, colWidths=[W * 0.5])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 2, ACCENT_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 36))

    story.append(Paragraph('<b>Ringback Tone Management Platform</b>', cover_info_style))
    story.append(Paragraph('Corporate Advertisement Delivery via Custom Ringback Tones', cover_info_style))
    story.append(Spacer(1, 48))
    story.append(Paragraph('Prepared for: TunePoa Executive Team', cover_info_style))
    story.append(Paragraph('Target Market: Tanzania & East Africa', cover_info_style))
    story.append(Spacer(1, 60))
    story.append(Paragraph('Version 1.0 - June 2025', cover_info_style))
    story.append(Paragraph('Confidential', cover_info_style))
    story.append(PageBreak())

    # ==================== TABLE OF CONTENTS ====================
    story.append(Paragraph('<b>Table of Contents</b>', h1_style))
    story.append(Spacer(1, 12))
    toc = TableOfContents()
    toc.levelStyles = [toc_h1_style, toc_h2_style, toc_h3_style]
    story.append(toc)
    story.append(PageBreak())

    # ==================== 1. EXECUTIVE SUMMARY ====================
    story.append(add_heading('<b>1. Executive Summary</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'TunePoa is an innovative ringback tone management platform designed to transform the way businesses '
        'communicate with their customers through one of the most underutilized advertising channels available '
        'today: the phone ringback tone. Every time a customer calls a business number, they are typically '
        'greeted with a monotonous standard ringtone. TunePoa replaces this ordinary experience with a '
        'professionally crafted corporate advertisement tune, turning every incoming call into a branded '
        'marketing touchpoint that reinforces business identity, promotes products and services, and delivers '
        'key messages directly to an engaged audience.'
    ))
    story.append(bp(
        'The market opportunity for TunePoa is substantial, particularly in the Tanzanian and broader East African '
        'market. The region has experienced explosive growth in mobile telecommunications, with mobile penetration '
        'rates exceeding 80% in Tanzania alone. Businesses across all sectors, from retail shops and restaurants '
        'to professional service firms and large corporations, rely heavily on phone communication with their '
        'customers. Despite this, very few businesses currently leverage their ringback tone as an advertising '
        'medium. TunePoa fills this gap by providing an end-to-end service that handles everything from creative '
        'script development and professional studio recording to ringback tone provisioning and ongoing subscription '
        'management.'
    ))
    story.append(bp(
        'The platform operates as a management and orchestration layer between business customers and Mobile '
        'Network Operators (MNOs) such as Vodacom, Airtel, Tigo, Halotel, and TTCL. This architecture acknowledges '
        'the reality that ringback tone provisioning is ultimately controlled by the MNOs, while positioning '
        'TunePoa as the indispensable intermediary that simplifies the process, ensures quality, and provides '
        'a seamless experience for business owners who would otherwise find the process complex and inaccessible. '
        'By centralizing the management of ringback tone advertisements across multiple network operators, '
        'TunePoa creates significant value for businesses seeking to enhance their brand presence with minimal '
        'effort and maximum impact.'
    ))
    story.append(bp(
        'TunePoa addresses a critical business advertising challenge: reaching customers in a personal, '
        'attention-grabbing manner without the intrusion of traditional advertising methods. Unlike social media '
        'ads that can be scrolled past or skipped, a ringback tone advertisement commands the caller\'s attention '
        'during the natural waiting period of a phone call. This captive-audience model ensures that the '
        'advertising message is heard in its entirety, making it one of the most effective micro-advertising '
        'formats available. With subscription packages designed to accommodate businesses of all sizes, from '
        'small enterprises to large corporations, TunePoa democratizes access to this powerful advertising channel.'
    ))

    # ==================== 2. PLATFORM ARCHITECTURE OVERVIEW ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>2. Platform Architecture Overview</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'The TunePoa platform is designed as a multi-layered management and orchestration system that serves '
        'as the central hub connecting business customers, the TunePoa operations team, and Mobile Network '
        'Operators (MNOs). The architecture is intentionally decoupled to ensure flexibility, scalability, and '
        'resilience, recognizing that the platform must operate reliably even when external dependencies, '
        'particularly MNO systems, experience delays or unavailability.'
    ))

    story.append(add_heading('<b>2.1 System Architecture Layers</b>', h2_style, 1))
    story.append(bp(
        'The platform is organized into four distinct architectural layers, each responsible for a specific '
        'set of functions while communicating through well-defined interfaces:'
    ))
    story.append(bul('<b>Presentation Layer:</b> The web-based user interface built with Next.js and React. '
                     'This layer provides role-based dashboards for business owners, administrators, studio '
                     'managers, and super administrators. The responsive design ensures accessibility from both '
                     'desktop and mobile browsers, which is critical in the East African market where mobile '
                     'internet usage predominates.'))
    story.append(bul('<b>Application Layer:</b> The core business logic engine implemented as Next.js API Routes. '
                     'This layer handles user authentication, service request processing, subscription management, '
                     'recording workflow orchestration, and integration coordination. It exposes RESTful API endpoints '
                     'that the presentation layer consumes and manages all state transitions within the platform.'))
    story.append(bul('<b>Integration Layer:</b> A dedicated middleware layer responsible for all external system '
                     'communication. This layer manages MNO API interactions, WhatsApp Business API messaging, '
                     'payment gateway integration, and file storage operations. It implements retry logic, circuit '
                     'breaker patterns, and fallback mechanisms to ensure robustness against external failures.'))
    story.append(bul('<b>Data Layer:</b> PostgreSQL database managed through Prisma ORM, providing persistent '
                     'storage for all platform data including user profiles, service requests, recordings, '
                     'subscriptions, payments, and audit logs. File storage for audio recordings is handled '
                     'separately using either local storage or Amazon S3 for scalability.'))

    story.append(add_heading('<b>2.2 System Architecture Diagram Description</b>', h2_style, 1))
    story.append(bp(
        'The following describes the logical system architecture in a top-down flow. At the top, four user '
        'actor types interact with the platform: Business Owners (accessing via web browser), Administrators '
        '(managing operations), Studio Managers (handling recordings), and Super Admins (full system control). '
        'All users authenticate through a NextAuth.js authentication gateway that enforces role-based access control. '
        'Behind the authentication layer sits the Next.js application server hosting both the frontend pages and '
        'the API route handlers. The application server communicates with the PostgreSQL database for data persistence '
        'and with the file storage system for audio recording management.'
    ))
    story.append(bp(
        'On the right side of the architecture, the integration layer connects to three external services: '
        'MNO provider APIs (or manual process tracking for providers without APIs), the WhatsApp Business API '
        'for sending recording verifications, and a payment gateway for subscription billing. Each external '
        'integration is wrapped in an adapter pattern that abstracts the provider-specific details, allowing '
        'the core application logic to interact with a uniform interface regardless of the underlying provider.'
    ))
    story.append(bp(
        'A notification service sits alongside the integration layer, dispatching alerts via email, SMS, and '
        'in-app notifications to keep all stakeholders informed of status changes, upcoming renewals, and '
        'action-required items. Background job processors handle asynchronous tasks such as subscription renewal '
        'checks, MNO status polling, and scheduled report generation.'
    ))

    story.append(add_heading('<b>2.3 MNO Integration Approaches</b>', h2_style, 1))
    story.append(bp(
        'MNO integration is the most critical and complex aspect of the TunePoa architecture. The platform '
        'supports three integration approaches to accommodate the varying technical capabilities of different '
        'network operators:'
    ))
    story.append(bul('<b>API-Based Integration:</b> For MNOs that expose ringback tone provisioning APIs, '
                     'TunePoa integrates directly using provider-specific API adapters. The adapter pattern allows '
                     'each MNO integration to be developed independently with its own authentication, request '
                     'formatting, and response parsing logic. Successful API calls trigger automatic status updates '
                     'in the subscription record.'))
    story.append(bul('<b>Manual Process Integration:</b> For MNOs that do not provide APIs or where API access '
                     'has not yet been established, TunePoa implements a manual workflow tracking system. Admin '
                     'users manually submit provisioning requests to the MNO, track the progress through the '
                     'TunePoa dashboard, and update the subscription status upon confirmation from the MNO. '
                     'The platform provides standardized checklists and status tracking to ensure no steps are missed.'))
    story.append(bul('<b>Hybrid Approach:</b> The recommended long-term strategy uses API integration where '
                     'available and manual tracking where not. The platform\'s adapter pattern makes it straightforward '
                     'to migrate a provider from manual to API integration as the technical relationship with the '
                     'MNO matures. The unified status model ensures consistent user experience regardless of the '
                     'underlying integration method.'))

    story.append(add_heading('<b>2.4 Workflow Orchestration</b>', h2_style, 1))
    story.append(bp(
        'The platform implements a state machine pattern for workflow orchestration. Each service request, '
        'recording, and subscription follows a defined lifecycle with explicit states and valid transitions. '
        'For example, a service request moves through states: Draft, Submitted, In Review, Approved, Recording '
        'Scheduled, Recording In Progress, Awaiting Verification, Approved by Client, Subscription Active, and '
        'Completed (or Rejected at various stages). Each state transition triggers appropriate notifications, '
        'assigns tasks to relevant team members, and updates the dashboard views. This approach ensures process '
        'consistency, provides full auditability, and prevents unauthorized state changes that could disrupt '
        'the business workflow.'
    ))

    # ==================== 3. CORE PLATFORM MODULES ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>3. Core Platform Modules</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'The TunePoa platform comprises seven core modules, each designed to handle a specific functional '
        'domain of the business. Together, these modules cover the complete lifecycle from customer onboarding '
        'through active subscription management and ongoing reporting. Each module is described in detail below.'
    ))

    # 3.1 User Management
    story.append(add_heading('<b>3.1 User Management Module</b>', h2_style, 1))
    story.append(bp(
        'The User Management Module serves as the foundation of the TunePoa platform, handling all aspects '
        'of user identity, authentication, and access control. Given the multi-stakeholder nature of the '
        'platform, this module must support diverse user types with varying levels of access and responsibility.'
    ))
    story.append(bp('<b>Purpose:</b> To manage the complete lifecycle of platform users, from initial '
                     'registration through ongoing profile management to deactivation. This module ensures '
                     'that only authorized users can access platform features and that each user interacts '
                     'with the system through an interface tailored to their role and responsibilities.'))
    story.append(bp('<b>Key Features:</b>'))
    story.append(bul('Registration via email address and phone number with business name and category. '
                     'Phone number verification is required given the business context and the Tanzanian market\'s '
                     'preference for mobile-based communication.'))
    story.append(bul('Multi-factor authentication combining password-based login with optional OTP verification '
                     'via SMS or WhatsApp for enhanced security, particularly for admin-level accounts.'))
    story.append(bul('Comprehensive profile management allowing users to update business information, contact '
                     'details, business category, and preferred MNO provider. Profile completeness indicators '
                     'guide users to provide all required information.'))
    story.append(bul('Role-based access control (RBAC) supporting four distinct roles: Business Owner, '
                     'Admin, Studio Manager, and Super Admin. Each role has precisely defined permissions that '
                     'determine which platform features and data the user can access.'))
    story.append(bul('User status management (Active, Suspended, Deactivated) enabling administrators to '
                     'control access in response to policy violations, payment issues, or user requests.'))
    story.append(bul('Activity logging that records all user actions for audit trail purposes, supporting '
                     'both security monitoring and business analytics.'))
    story.append(bp(
        'The registration flow is designed to be straightforward for business owners while collecting all '
        'information needed to initiate the ringback tone service. After registering, business owners gain '
        'immediate access to the service request form and can begin the process of submitting their advertisement '
        'requirements. Administrative users are created by Super Admins through a separate internal provisioning '
        'process that bypasses the public registration flow.'
    ))

    # 3.2 Service Request Module
    story.append(add_heading('<b>3.2 Service Request Module</b>', h2_style, 1))
    story.append(bp(
        'The Service Request Module manages the intake process through which business owners communicate their '
        'ringback tone advertisement requirements to the TunePoa team. This module transforms what would '
        'otherwise be an ad-hoc process of phone calls and emails into a structured, trackable digital workflow.'
    ))
    story.append(bp('<b>Purpose:</b> To provide a standardized mechanism for business owners to submit, '
                     'modify, and track their ringback tone service requests from initial submission through '
                     'to final delivery, ensuring no requirements are lost and all stakeholders maintain '
                     'visibility into the current status of each request.'))
    story.append(bp('<b>Key Features:</b>'))
    story.append(bul('Structured service request form capturing business category, target audience demographics, '
                     'preferred advertisement style (professional, casual, energetic, informative), key messages '
                     'to include, preferred language (Swahili, English, or mixed), and any specific audio '
                     'preferences such as background music style or voice gender.'))
    story.append(bul('Ad script submission with a rich text editor that allows business owners to draft their '
                     'advertisement script directly in the platform, or upload a pre-written script document. '
                     'Character count and estimated duration indicators help users create scripts that fit '
                     'within standard ringback tone length constraints (typically 20-40 seconds).'))
    story.append(bul('Document and information upload supporting multiple file formats (PDF, DOCX, images, '
                     'audio samples) that business owners may want to share as reference material for the '
                     'production team.'))
    story.append(bul('Real-time status tracking visible to both the business owner and internal team members, '
                     'showing the current stage of the request (Submitted, Under Review, In Production, '
                     'Awaiting Approval, Completed) along with timestamps for each stage transition.'))
    story.append(bul('Communication thread linked to each service request, enabling structured conversations '
                     'between the business owner and the TunePoa team regarding the request, reducing reliance '
                     'on external communication channels.'))
    story.append(bul('Request modification and revision support, allowing business owners to update their '
                     'requirements before production begins, with change tracking to maintain a complete history.'))
    story.append(bp(
        'The service request workflow is designed to minimize friction for business owners while ensuring '
        'the TunePoa production team receives all necessary information to create an effective advertisement. '
        'Upon submission, requests enter a review queue accessible to administrators, who can request additional '
        'information, approve the request for production, or decline it with a reason. Once approved, the '
        'request transitions to the Ad Management Module for recording and production.'
    ))

    # 3.3 Ad Management Module
    story.append(add_heading('<b>3.3 Ad Management Module</b>', h2_style, 1))
    story.append(bp(
        'The Ad Management Module is the operational heart of TunePoa, managing the creative production workflow '
        'from script finalization through studio recording to client verification and approval. This module '
        'coordinates the activities of the TunePoa studio team and integrates with WhatsApp for client '
        'communication and verification.'
    ))
    story.append(bp('<b>Purpose:</b> To orchestrate the complete advertisement production lifecycle, ensuring '
                     'that each recording is produced to professional quality standards, delivered to the '
                     'client for verification via WhatsApp, and approved before deployment to the MNO ringback '
                     'tone system.'))
    story.append(bp('<b>Key Features:</b>'))
    story.append(bul('<b>Script Management:</b> Studio managers can view, edit, and finalize the advertisement '
                     'script submitted with the service request. Version control tracks all script revisions, '
                     'allowing the team to revert to previous versions if needed. The script editor provides '
                     'word count, estimated reading duration, and pronunciation notes for challenging terms.'))
    story.append(bul('<b>Recording Scheduling:</b> A scheduling interface allows studio managers to plan '
                     'recording sessions, assign voice artists, book studio time, and set production deadlines. '
                     'Calendar views show upcoming sessions and their current status.'))
    story.append(bul('<b>Recording File Management:</b> Upload, version, and organize audio recording files '
                     'with metadata including duration, file format, sample rate, and associated service request. '
                     'Multiple recording versions can be stored for a single request, supporting A/B testing '
                     'and revision requests from clients.'))
    story.append(bul('<b>WhatsApp Integration:</b> One-click dispatch of recorded advertisements to clients '
                     'via the WhatsApp Business API for verification and approval. The system tracks message '
                     'delivery status, read receipts, and client responses. When a client responds with '
                     'approval (such as "go ahead"), the system can capture this response and advance the '
                     'workflow to the subscription activation stage.'))
    story.append(bul('<b>Approval Workflow:</b> A structured approval process where recordings can be approved, '
                     'rejected, or returned for revision. Rejection reasons are captured to guide the production '
                     'team\'s revisions. The system supports multiple revision cycles with full history tracking.'))
    story.append(bul('<b>Quality Assurance Checklist:</b> Standardized quality checklists for studio managers '
                     'to verify audio quality, script accuracy, duration compliance, and brand guideline adherence '
                     'before sending recordings to clients.'))
    story.append(bp(
        'The Ad Management Module bridges the gap between the business owner\'s creative vision and the '
        'final ringback tone deployment. By managing the production workflow within the platform rather than '
        'across multiple disconnected tools, TunePoa ensures consistency, traceability, and efficiency. The '
        'WhatsApp integration is particularly significant in the Tanzanian market, where WhatsApp is the '
        'dominant communication platform and clients expect to review and approve content through familiar channels.'
    ))

    # 3.4 Subscription & Package Management
    story.append(add_heading('<b>3.4 Subscription & Package Management</b>', h2_style, 1))
    story.append(bp(
        'The Subscription and Package Management Module handles the commercial aspects of the TunePoa platform, '
        'defining service packages, managing billing cycles, processing payments, and tracking subscription '
        'lifecycles from activation through renewal or expiration.'
    ))
    story.append(bp('<b>Purpose:</b> To provide flexible subscription options that accommodate businesses of '
                     'different sizes and budgets, while ensuring accurate billing, timely renewals, and '
                     'clear visibility into subscription status for both business owners and administrators.'))
    story.append(bp('<b>Subscription Packages:</b>'))

    # Package table
    pkg_data = [
        [Paragraph('<b>Package</b>', tbl_header_style),
         Paragraph('<b>Price (TZS)</b>', tbl_header_style),
         Paragraph('<b>Duration</b>', tbl_header_style),
         Paragraph('<b>Key Features</b>', tbl_header_style)],
        [Paragraph('Bronze', tbl_cell_center),
         Paragraph('50,000', tbl_cell_center),
         Paragraph('3 Months', tbl_cell_center),
         Paragraph('1 ad, single MNO, basic support', tbl_cell_style)],
        [Paragraph('Silver', tbl_cell_center),
         Paragraph('90,000', tbl_cell_center),
         Paragraph('3 Months', tbl_cell_center),
         Paragraph('2 ads, single MNO, priority support, analytics', tbl_cell_style)],
        [Paragraph('Gold', tbl_cell_center),
         Paragraph('150,000', tbl_cell_center),
         Paragraph('6 Months', tbl_cell_center),
         Paragraph('3 ads, multi-MNO, dedicated manager, analytics', tbl_cell_style)],
        [Paragraph('Platinum', tbl_cell_center),
         Paragraph('250,000', tbl_cell_center),
         Paragraph('12 Months', tbl_cell_center),
         Paragraph('Unlimited ads, all MNOs, premium support, full analytics, A/B testing', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(pkg_data, [W * 0.14, W * 0.16, W * 0.14, W * 0.56]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 1.</b> TunePoa Subscription Packages', caption_style))
    story.append(Spacer(1, 18))

    story.append(bp('<b>Key Features of the Module:</b>'))
    story.append(bul('<b>Package Configuration:</b> Administrators can create and modify subscription packages, '
                     'adjusting pricing, duration, feature sets, and availability. Packages can be marked as '
                     'active or inactive without deleting historical data.'))
    story.append(bul('<b>Billing Cycle Management:</b> Support for monthly, quarterly, semi-annual, and annual '
                     'billing cycles with automatic proration for mid-cycle upgrades or downgrades. The system '
                     'generates invoices automatically at the start of each billing period.'))
    story.append(bul('<b>Payment Tracking:</b> Integration with local payment methods popular in Tanzania including '
                     'M-Pesa, Tigo Pesa, Airtel Money, and bank transfers. Payment status tracking (Pending, '
                     'Confirmed, Failed, Refunded) with automated reminders for overdue payments.'))
    story.append(bul('<b>Subscription Lifecycle:</b> Complete lifecycle management from activation through active '
                     'service to expiration, including suspension for non-payment and reactivation upon payment '
                     'receipt. Grace periods prevent immediate service interruption for temporary payment delays.'))
    story.append(bul('<b>Renewal Automation:</b> Automated renewal reminders sent 14 days and 7 days before '
                     'subscription expiration via email, SMS, and WhatsApp. Auto-renewal option for subscribers '
                     'who pre-authorize recurring payments.'))
    story.append(bul('<b>MNO Reference Tracking:</b> Each subscription record maintains the MNO provider, '
                     'MNO-assigned reference number, and provisioning status, providing end-to-end traceability '
                     'from subscription purchase to active ringback tone deployment.'))

    # 3.5 MNO Integration Module
    story.append(add_heading('<b>3.5 MNO Integration Module</b>', h2_style, 1))
    story.append(bp(
        'The MNO Integration Module is the most technically critical component of the TunePoa platform. It '
        'manages all interactions with Mobile Network Operators for ringback tone provisioning, status '
        'monitoring, and issue resolution. This module must handle the inherent complexity of working with '
        'multiple independent operators, each with their own systems, processes, and reliability characteristics.'
    ))
    story.append(bp('<b>Purpose:</b> To abstract the complexity of MNO interactions behind a unified interface, '
                     'enabling the rest of the platform to manage ringback tone provisioning without being '
                     'concerned with provider-specific details. The module supports both API-based and manual '
                     'integration methods to maximize coverage across all target MNOs.'))
    story.append(bp('<b>Key Features:</b>'))
    story.append(bul('<b>MNO Provider Management:</b> Centralized configuration for each MNO including provider '
                     'name, country of operation, API endpoint credentials (if available), contact information '
                     'for manual processes, and operational status. Providers can be enabled or disabled without '
                     'affecting historical data.'))
    story.append(bul('<b>Provisioning Tracking:</b> For each subscription, the module tracks the provisioning '
                     'request to the MNO, including submission timestamp, MNO reference number, current status '
                     '(Pending, Processing, Active, Failed, Suspended), and any error messages received.'))
    story.append(bul('<b>Status Synchronization:</b> Periodic polling of MNO APIs (where available) to synchronize '
                     'the provisioning status, ensuring the TunePoa platform reflects the actual state on the '
                     'MNO side. For manual integrations, status update forms are provided for administrators.'))
    story.append(bul('<b>Error Handling and Retry Logic:</b> Intelligent retry mechanisms with exponential '
                     'backoff for failed API calls, circuit breaker patterns to prevent cascading failures, '
                     'and alerting for persistent issues that require human intervention.'))
    story.append(bul('<b>Manual Override Capabilities:</b> Administrative controls to manually update '
                     'provisioning status, re-submit provisioning requests, and escalate issues. This is '
                     'essential for maintaining service quality when automated processes encounter issues.'))
    story.append(bul('<b>Health Monitoring:</b> Dashboard showing the real-time health of each MNO integration, '
                     'including API response times, success rates, and pending action counts. Historical '
                     'reliability data informs decisions about provider prioritization and process improvement.'))

    # 3.6 Admin Dashboard
    story.append(add_heading('<b>3.6 Admin Dashboard</b>', h2_style, 1))
    story.append(bp(
        'The Admin Dashboard provides the TunePoa operations team with a centralized command center for '
        'monitoring and managing all platform activities. It consolidates information from across all modules '
        'into actionable views that enable efficient operations management.'
    ))
    story.append(bp('<b>Purpose:</b> To provide administrators with real-time visibility into platform '
                     'operations, actionable management queues, and analytical insights that support informed '
                     'decision-making and efficient day-to-day operations.'))
    story.append(bp('<b>Key Features:</b>'))
    story.append(bul('<b>Overview Analytics:</b> A high-level dashboard showing key performance indicators '
                     'including total active subscribers, monthly revenue, pending service requests, recordings '
                     'awaiting approval, and MNO provisioning status across all providers.'))
    story.append(bul('<b>Request Management Queue:</b> A prioritized, filterable list of all pending service '
                     'requests and recordings awaiting action. Quick-action buttons allow administrators to '
                     'approve, reject, or assign items directly from the queue.'))
    story.append(bul('<b>Subscription Monitoring:</b> Real-time view of all subscriptions with status indicators, '
                     'upcoming renewal dates, and at-risk accounts (subscriptions expiring within 7 days or '
                     'with failed payment attempts).'))
    story.append(bul('<b>Revenue Tracking:</b> Daily, weekly, and monthly revenue summaries broken down by '
                     'package type, MNO provider, and payment method. Trend analysis identifies growth patterns '
                     'and seasonal variations.'))
    story.append(bul('<b>User Management Interface:</b> Tools for viewing, searching, and managing user accounts, '
                     'including the ability to reset passwords, adjust roles, and manage user status.'))
    story.append(bul('<b>Alert and Notification Center:</b> Consolidated view of system alerts, MNO integration '
                     'failures, payment issues, and other items requiring administrative attention.'))

    # 3.7 Reporting & Analytics
    story.append(add_heading('<b>3.7 Reporting & Analytics Module</b>', h2_style, 1))
    story.append(bp(
        'The Reporting and Analytics Module transforms operational data into actionable business intelligence '
        'that supports strategic decision-making. It provides both standard reports for routine monitoring '
        'and customizable analytics for deeper investigation.'
    ))
    story.append(bp('<b>Purpose:</b> To provide comprehensive data analysis capabilities that enable the '
                     'TunePoa management team to understand business performance, identify trends, optimize '
                     'operations, and make data-driven decisions about growth strategies and resource allocation.'))
    story.append(bp('<b>Key Features:</b>'))
    story.append(bul('<b>Subscriber Growth Analysis:</b> Time-series analysis of new registrations, active '
                     'subscribers, and churn rates with segmentation by business category, geographic region, '
                     'and subscription package. Cohort analysis shows retention patterns for subscribers acquired '
                     'in different time periods.'))
    story.append(bul('<b>Revenue Reports:</b> Detailed revenue breakdowns by time period, package type, MNO '
                     'provider, and payment method. Monthly recurring revenue (MRR) and annual recurring '
                     'revenue (ARR) calculations provide financial planning inputs.'))
    story.append(bul('<b>Package Popularity Metrics:</b> Analysis of which packages are most popular among '
                     'different business segments, conversion rates between package tiers, and upgrade/downgrade '
                     'patterns that inform pricing strategy.'))
    story.append(bul('<b>MNO Performance Analytics:</b> Success rates, average provisioning times, and failure '
                     'patterns for each MNO provider. This data is critical for negotiating with MNOs, '
                     'identifying reliability issues, and planning integration improvements.'))
    story.append(bul('<b>Churn Analysis:</b> Deep-dive analysis into why subscribers leave, including '
                     'correlation with MNO provisioning failures, payment issues, and support interactions. '
                     'Predictive churn models identify at-risk subscribers before they cancel.'))
    story.append(bul('<b>Export Capabilities:</b> All reports can be exported in CSV and PDF formats for '
                     'sharing with stakeholders, investors, and MNO partners. Scheduled report generation '
                     'delivers key metrics to management automatically.'))

    # ==================== 4. MNO INTEGRATION STRATEGY ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>4. MNO Integration Strategy</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'The MNO Integration Strategy is the most critical technical and operational consideration for '
        'TunePoa. Since ringback tone provisioning is controlled entirely by Mobile Network Operators, the '
        'platform\'s success depends on its ability to work effectively with MNOs despite varying levels of '
        'technical sophistication, API availability, and operational reliability. This section outlines a '
        'comprehensive strategy that balances immediate practicality with long-term scalability.'
    ))

    story.append(add_heading('<b>4.1 Option A: API Integration</b>', h2_style, 1))
    story.append(bp(
        'API integration represents the ideal scenario where TunePoa can programmatically manage ringback tone '
        'provisioning through direct MNO APIs. In this model, the TunePoa platform sends API requests to the '
        'MNO to activate, modify, or deactivate ringback tones on behalf of a subscriber, and receives real-time '
        'status updates in response.'
    ))
    story.append(bp('<b>How It Works:</b> Each MNO that provides a ringback tone API is integrated through a '
                     'provider-specific adapter that handles authentication (typically OAuth 2.0 or API key-based), '
                     'request formatting according to the MNO\'s specification, response parsing, and error '
                     'handling. The adapter implements a standard interface defined by the TunePoa integration '
                     'framework, allowing the core platform to interact with all MNOs uniformly.'))
    story.append(bp('<b>Advantages:</b> Real-time provisioning (typically within seconds to minutes), '
                     'automated status tracking, reduced manual effort, scalability to handle high volumes, '
                     'and accurate data synchronization between TunePoa and the MNO systems.'))
    story.append(bp('<b>Challenges:</b> Not all MNOs offer public APIs for ringback tone management. Those '
                     'that do may have complex approval processes, rate limits, and variable reliability. API '
                     'specifications may change without notice, requiring ongoing maintenance of the adapter code.'))

    story.append(add_heading('<b>4.2 Option B: Manual Process</b>', h2_style, 1))
    story.append(bp(
        'Manual process integration acknowledges the reality that some MNOs, particularly in developing '
        'markets, do not provide API access for ringback tone provisioning. In this model, TunePoa operations '
        'staff interact with the MNO through their standard business channels (portals, email, phone, or '
        'in-person visits) while the TunePoa platform tracks the progress of each request.'
    ))
    story.append(bp('<b>How It Works:</b> When a subscription is activated, the platform generates a provisioning '
                     'task in the MNO Integration Module. A designated administrator completes the provisioning '
                     'through the MNO\'s available channels, then returns to the TunePoa dashboard to update the '
                     'status with the MNO reference number and confirmation details. The platform tracks the '
                     'time taken, records any issues encountered, and maintains a complete history of all '
                     'manual interactions.'))
    story.append(bp('<b>Advantages:</b> Works with any MNO regardless of their technical capabilities, '
                     'requires no technical agreement with the MNO, and allows TunePoa to begin operations '
                     'immediately while building relationships with MNOs for future API access.'))
    story.append(bp('<b>Challenges:</b> Significantly slower provisioning (hours to days), higher operational '
                     'cost due to manual labor, increased risk of human error, limited scalability, and '
                     'dependency on individual administrator availability.'))

    story.append(add_heading('<b>4.3 Option C: Hybrid Approach (Recommended)</b>', h2_style, 1))
    story.append(bp(
        'The hybrid approach is the recommended strategy for TunePoa, combining API integration where available '
        'with manual process tracking where not. This approach maximizes automation and efficiency while '
        'ensuring no MNO is excluded due to technical limitations.'
    ))
    story.append(bp('<b>Implementation Strategy:</b> The platform\'s adapter pattern provides a unified '
                     'provisioning interface. For MNOs with APIs, the adapter makes direct API calls. For '
                     'MNOs without APIs, the adapter creates a manual task and tracks its completion. The '
                     'core platform code is identical regardless of the underlying integration method, '
                     'making it transparent to users and simplifying maintenance.'))
    story.append(bp(
        'The hybrid approach also supports gradual migration: as TunePoa establishes technical partnerships '
        'with MNOs and gains API access, providers can be migrated from manual to automated integration '
        'without any changes to the user-facing platform or business logic. Historical data is preserved '
        'seamlessly during migration.'
    ))

    story.append(add_heading('<b>4.4 Tracking MNO Provisioning Status</b>', h2_style, 1))
    story.append(bp(
        'Regardless of the integration method, all provisioning activities are tracked in the MNO Integration '
        'Module with the following standardized statuses:'
    ))

    status_data = [
        [Paragraph('<b>Status</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style),
         Paragraph('<b>Trigger</b>', tbl_header_style)],
        [Paragraph('Pending', tbl_cell_center),
         Paragraph('Provisioning request created, not yet submitted to MNO', tbl_cell_style),
         Paragraph('Subscription activated', tbl_cell_style)],
        [Paragraph('Submitted', tbl_cell_center),
         Paragraph('Request sent to MNO (API call or manual submission)', tbl_cell_style),
         Paragraph('API call made or admin marks as submitted', tbl_cell_style)],
        [Paragraph('Processing', tbl_cell_center),
         Paragraph('MNO is working on the provisioning request', tbl_cell_style),
         Paragraph('MNO acknowledges receipt', tbl_cell_style)],
        [Paragraph('Active', tbl_cell_center),
         Paragraph('Ringback tone is live and working', tbl_cell_style),
         Paragraph('MNO confirms activation', tbl_cell_style)],
        [Paragraph('Failed', tbl_cell_center),
         Paragraph('Provisioning failed, retry or manual intervention needed', tbl_cell_style),
         Paragraph('MNO returns error or timeout', tbl_cell_style)],
        [Paragraph('Suspended', tbl_cell_center),
         Paragraph('Ringback tone temporarily inactive (e.g., payment issue)', tbl_cell_style),
         Paragraph('Admin or system marks as suspended', tbl_cell_style)],
        [Paragraph('Inactive', tbl_cell_center),
         Paragraph('Ringback tone removed (subscription expired or cancelled)', tbl_cell_style),
         Paragraph('Subscription ended', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(status_data, [W * 0.14, W * 0.48, W * 0.38]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 2.</b> MNO Provisioning Status Definitions', caption_style))
    story.append(Spacer(1, 18))

    story.append(add_heading('<b>4.5 Handling Delays and Failures</b>', h2_style, 1))
    story.append(bp(
        'MNO-side delays and failures are inevitable, and the platform must handle them gracefully to maintain '
        'customer trust. The following mechanisms are implemented:'
    ))
    story.append(bul('<b>Automated Retry Logic:</b> Failed API calls are retried with exponential backoff '
                     '(1 minute, 5 minutes, 15 minutes, 1 hour), up to a configurable maximum retry count. '
                     'Each retry is logged with the full request and response details for debugging.'))
    story.append(bul('<b>Timeout Management:</b> API calls that do not receive a response within a configurable '
                     'timeout period (default: 30 seconds) are treated as failed and queued for retry. '
                     'Long-running manual requests that exceed expected timeframes trigger escalation alerts.'))
    story.append(bul('<b>Escalation Workflow:</b> When a provisioning request remains in a non-active state '
                     'beyond a defined threshold (e.g., 48 hours for manual, 4 hours for API), the system '
                     'automatically escalates to a senior administrator for manual intervention.'))
    story.append(bul('<b>Customer Communication:</b> Automated notifications keep business owners informed of '
                     'provisioning progress. If delays occur, proactive communication manages expectations and '
                     'demonstrates responsiveness.'))
    story.append(bul('<b>Fallback Procedures:</b> For critical failures where automated and standard manual '
                     'processes fail, documented escalation procedures include contacting MNO account managers '
                     'directly, visiting MNO service centers, or engaging alternative provisioning channels.'))

    story.append(add_heading('<b>4.6 Recommendation for Initial Phase</b>', h2_style, 1))
    story.append(bp(
        'For the initial launch phase, TunePoa should adopt the manual process approach across all MNOs '
        'while simultaneously initiating discussions with Vodacom Tanzania and Airtel Tanzania (the two '
        'largest operators) to establish API partnerships. This strategy allows TunePoa to begin generating '
        'revenue and building a customer base immediately, while laying the groundwork for automation that '
        'will improve margins and scalability as the business grows. The platform should be built from day '
        'one with the adapter architecture that supports API integration, so that adding API connectivity '
        'requires only implementing a new adapter rather than modifying core platform code. A target of '
        'achieving API integration with at least one major MNO within 6-9 months of launch is recommended, '
        'with the remaining operators following in the subsequent 6 months.'
    ))

    # ==================== 5. WHATSAPP INTEGRATION ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>5. WhatsApp Integration</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'WhatsApp is the dominant communication platform in Tanzania, with over 90% of smartphone users '
        'actively using it for personal and business communication. Integrating WhatsApp into the TunePoa '
        'workflow is not merely a convenience feature; it is a strategic necessity that aligns the platform '
        'with the communication preferences of its target market.'
    ))

    story.append(add_heading('<b>5.1 WhatsApp Business API Overview</b>', h2_style, 1))
    story.append(bp(
        'TunePoa will use the Meta WhatsApp Business API to send recording files and verification messages '
        'to business owners. The WhatsApp Business API provides several advantages over standard WhatsApp, '
        'including message templates approved by Meta, delivery and read receipts, higher message throughput '
        'limits, and the ability to send rich media including audio files. The integration is implemented '
        'through a dedicated WhatsApp service module within the Integration Layer.'
    ))

    story.append(add_heading('<b>5.2 Verification Workflow via WhatsApp</b>', h2_style, 1))
    story.append(bp(
        'The verification workflow is a critical touchpoint in the customer journey. After a recording is '
        'produced and passes internal quality assurance, the following automated process is initiated:'
    ))
    story.append(bul('<b>Step 1 - Message Composition:</b> The system generates a WhatsApp message containing '
                     'a brief introduction, the audio recording file, and instructions for the client to '
                     'listen and respond with either approval ("go ahead" or similar affirmative) or '
                     'revision requests.'))
    story.append(bul('<b>Step 2 - Message Dispatch:</b> The message is sent to the client\'s registered '
                     'WhatsApp number via the Business API. The system captures the message ID for tracking '
                     'purposes and records the timestamp in the whatsapp_verifications table.'))
    story.append(bul('<b>Step 3 - Delivery Tracking:</b> The system monitors delivery receipts (sent, '
                     'delivered, read) through webhook callbacks from the WhatsApp Business API. If the '
                     'message is not delivered within 2 hours, an automatic retry is attempted. Persistent '
                     'delivery failures trigger an alert for manual follow-up via phone call.'))
    story.append(bul('<b>Step 4 - Response Capture:</b> When the client responds to the verification message, '
                     'the webhook callback captures the response text and updates the verification record. '
                     'The system analyzes the response for keywords indicating approval ("go ahead", "approved", '
                     '"yes", "sawa", "nidokea") or rejection ("change", "revise", "no", "hapana").'))
    story.append(bul('<b>Step 5 - Workflow Advancement:</b> Based on the captured response, the system '
                     'automatically advances the workflow: approved recordings move to the subscription '
                     'activation stage, while rejected recordings return to the studio for revision with '
                     'the client\'s feedback attached.'))

    story.append(add_heading('<b>5.3 Auto-Confirmation and Manual Fallback</b>', h2_style, 1))
    story.append(bp(
        'While the auto-confirmation system handles the majority of verification responses efficiently, a '
        'manual fallback process is essential for cases where the automated response analysis is uncertain '
        'or the client responds through a different channel. If the system cannot confidently classify a '
        'response as approval or rejection, the verification record is flagged as "Needs Manual Review" '
        'and appears in the admin action queue. A studio manager or administrator reviews the response and '
        'manually updates the status. Additionally, clients can always call or email the TunePoa team to '
        'provide their approval, and the administrator can manually update the verification record accordingly. '
        'The platform supports manual status updates at every stage of the WhatsApp verification process '
        'to ensure that no client response is lost due to technical limitations.'
    ))

    story.append(add_heading('<b>5.4 Compliance and Message Template Management</b>', h2_style, 1))
    story.append(bp(
        'The WhatsApp Business API requires all outbound messages to use pre-approved message templates. '
        'TunePoa will register message templates for each type of communication (recording verification, '
        'subscription renewal reminder, payment confirmation, etc.) through the Meta Business Platform. '
        'Template management is handled within the platform, with version tracking ensuring that template '
        'changes are reviewed and approved before submission to Meta. The platform monitors template approval '
        'status and alerts administrators when templates are rejected or require re-approval.'
    ))

    # ==================== 6. DATABASE SCHEMA DESIGN ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>6. Database Schema Design</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'The database schema is designed to support all platform operations with a focus on data integrity, '
        'query performance, and maintainability. The following tables constitute the core data model, managed '
        'through Prisma ORM with PostgreSQL as the underlying database engine.'
    ))

    # Users table
    story.append(add_heading('<b>6.1 users</b>', h3_style, 2))
    users_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique user identifier', tbl_cell_style)],
        [Paragraph('name', tbl_cell_style), Paragraph('VARCHAR(255)', tbl_cell_style), Paragraph('Full name of the user', tbl_cell_style)],
        [Paragraph('email', tbl_cell_style), Paragraph('VARCHAR(255)', tbl_cell_style), Paragraph('Email address (unique)', tbl_cell_style)],
        [Paragraph('phone', tbl_cell_style), Paragraph('VARCHAR(20)', tbl_cell_style), Paragraph('Phone number (unique)', tbl_cell_style)],
        [Paragraph('business_name', tbl_cell_style), Paragraph('VARCHAR(255)', tbl_cell_style), Paragraph('Registered business name', tbl_cell_style)],
        [Paragraph('business_category', tbl_cell_style), Paragraph('VARCHAR(100)', tbl_cell_style), Paragraph('Industry or business category', tbl_cell_style)],
        [Paragraph('role', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('BUSINESS_OWNER, ADMIN, STUDIO_MANAGER, SUPER_ADMIN', tbl_cell_style)],
        [Paragraph('status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('ACTIVE, SUSPENDED, DEACTIVATED', tbl_cell_style)],
        [Paragraph('password_hash', tbl_cell_style), Paragraph('VARCHAR(255)', tbl_cell_style), Paragraph('Bcrypt hashed password', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Account creation timestamp', tbl_cell_style)],
        [Paragraph('updated_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Last profile update timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(users_data, [W * 0.18, W * 0.18, W * 0.64]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 3.</b> users table schema', caption_style))
    story.append(Spacer(1, 18))

    # service_requests table
    story.append(add_heading('<b>6.2 service_requests</b>', h3_style, 2))
    sr_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique request identifier', tbl_cell_style)],
        [Paragraph('user_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Reference to users table', tbl_cell_style)],
        [Paragraph('business_category', tbl_cell_style), Paragraph('VARCHAR(100)', tbl_cell_style), Paragraph('Category of business', tbl_cell_style)],
        [Paragraph('target_audience', tbl_cell_style), Paragraph('TEXT', tbl_cell_style), Paragraph('Description of target audience', tbl_cell_style)],
        [Paragraph('ad_type', tbl_cell_style), Paragraph('VARCHAR(50)', tbl_cell_style), Paragraph('Type of advertisement', tbl_cell_style)],
        [Paragraph('ad_style', tbl_cell_style), Paragraph('VARCHAR(50)', tbl_cell_style), Paragraph('Professional, casual, energetic, etc.', tbl_cell_style)],
        [Paragraph('language', tbl_cell_style), Paragraph('VARCHAR(20)', tbl_cell_style), Paragraph('Swahili, English, or mixed', tbl_cell_style)],
        [Paragraph('script', tbl_cell_style), Paragraph('TEXT', tbl_cell_style), Paragraph('Ad script content', tbl_cell_style)],
        [Paragraph('notes', tbl_cell_style), Paragraph('TEXT', tbl_cell_style), Paragraph('Additional notes or instructions', tbl_cell_style)],
        [Paragraph('status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('DRAFT, SUBMITTED, IN_REVIEW, APPROVED, IN_PRODUCTION, COMPLETED, REJECTED', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Request creation timestamp', tbl_cell_style)],
        [Paragraph('updated_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Last update timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(sr_data, [W * 0.18, W * 0.18, W * 0.64]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 4.</b> service_requests table schema', caption_style))
    story.append(Spacer(1, 18))

    # recordings table
    story.append(add_heading('<b>6.3 recordings</b>', h3_style, 2))
    rec_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique recording identifier', tbl_cell_style)],
        [Paragraph('request_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Reference to service_requests', tbl_cell_style)],
        [Paragraph('studio_manager_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Assigned studio manager', tbl_cell_style)],
        [Paragraph('file_url', tbl_cell_style), Paragraph('VARCHAR(500)', tbl_cell_style), Paragraph('URL to audio file in storage', tbl_cell_style)],
        [Paragraph('duration_seconds', tbl_cell_style), Paragraph('INTEGER', tbl_cell_style), Paragraph('Recording duration in seconds', tbl_cell_style)],
        [Paragraph('version', tbl_cell_style), Paragraph('INTEGER', tbl_cell_style), Paragraph('Revision version number', tbl_cell_style)],
        [Paragraph('status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('DRAFT, RECORDING, QA_REVIEW, AWAITING_APPROVAL, APPROVED, REJECTED', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Recording creation timestamp', tbl_cell_style)],
        [Paragraph('updated_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Last update timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(rec_data, [W * 0.20, W * 0.18, W * 0.62]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 5.</b> recordings table schema', caption_style))
    story.append(Spacer(1, 18))

    # whatsapp_verifications table
    story.append(add_heading('<b>6.4 whatsapp_verifications</b>', h3_style, 2))
    wa_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique verification identifier', tbl_cell_style)],
        [Paragraph('recording_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Reference to recordings table', tbl_cell_style)],
        [Paragraph('message_id', tbl_cell_style), Paragraph('VARCHAR(100)', tbl_cell_style), Paragraph('WhatsApp Business API message ID', tbl_cell_style)],
        [Paragraph('phone_number', tbl_cell_style), Paragraph('VARCHAR(20)', tbl_cell_style), Paragraph('Recipient phone number', tbl_cell_style)],
        [Paragraph('delivery_status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('SENT, DELIVERED, READ, FAILED', tbl_cell_style)],
        [Paragraph('response_text', tbl_cell_style), Paragraph('TEXT', tbl_cell_style), Paragraph('Client response message text', tbl_cell_style)],
        [Paragraph('status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('PENDING, APPROVED, REJECTED, NEEDS_REVIEW', tbl_cell_style)],
        [Paragraph('sent_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('When message was sent', tbl_cell_style)],
        [Paragraph('responded_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('When client responded (nullable)', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(wa_data, [W * 0.20, W * 0.18, W * 0.62]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 6.</b> whatsapp_verifications table schema', caption_style))
    story.append(Spacer(1, 18))

    # packages table
    story.append(add_heading('<b>6.5 packages</b>', h3_style, 2))
    pkg_tbl_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique package identifier', tbl_cell_style)],
        [Paragraph('name', tbl_cell_style), Paragraph('VARCHAR(50)', tbl_cell_style), Paragraph('Bronze, Silver, Gold, Platinum', tbl_cell_style)],
        [Paragraph('description', tbl_cell_style), Paragraph('TEXT', tbl_cell_style), Paragraph('Package description', tbl_cell_style)],
        [Paragraph('price', tbl_cell_style), Paragraph('DECIMAL(10,2)', tbl_cell_style), Paragraph('Price in Tanzanian Shillings', tbl_cell_style)],
        [Paragraph('duration_months', tbl_cell_style), Paragraph('INTEGER', tbl_cell_style), Paragraph('Subscription duration', tbl_cell_style)],
        [Paragraph('max_ads', tbl_cell_style), Paragraph('INTEGER', tbl_cell_style), Paragraph('Maximum number of ads allowed', tbl_cell_style)],
        [Paragraph('max_mnos', tbl_cell_style), Paragraph('INTEGER', tbl_cell_style), Paragraph('Maximum MNO providers', tbl_cell_style)],
        [Paragraph('features', tbl_cell_style), Paragraph('JSONB', tbl_cell_style), Paragraph('Feature flags as JSON object', tbl_cell_style)],
        [Paragraph('is_active', tbl_cell_style), Paragraph('BOOLEAN', tbl_cell_style), Paragraph('Whether package is available', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Package creation timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(pkg_tbl_data, [W * 0.20, W * 0.18, W * 0.62]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 7.</b> packages table schema', caption_style))
    story.append(Spacer(1, 18))

    # subscriptions table
    story.append(add_heading('<b>6.6 subscriptions</b>', h3_style, 2))
    sub_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique subscription identifier', tbl_cell_style)],
        [Paragraph('user_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Business owner reference', tbl_cell_style)],
        [Paragraph('package_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Subscribed package reference', tbl_cell_style)],
        [Paragraph('service_request_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Associated service request', tbl_cell_style)],
        [Paragraph('start_date', tbl_cell_style), Paragraph('DATE', tbl_cell_style), Paragraph('Subscription start date', tbl_cell_style)],
        [Paragraph('end_date', tbl_cell_style), Paragraph('DATE', tbl_cell_style), Paragraph('Subscription end date', tbl_cell_style)],
        [Paragraph('status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('ACTIVE, SUSPENDED, EXPIRED, CANCELLED', tbl_cell_style)],
        [Paragraph('amount', tbl_cell_style), Paragraph('DECIMAL(10,2)', tbl_cell_style), Paragraph('Subscription amount paid', tbl_cell_style)],
        [Paragraph('mno_provider_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('MNO for ringback tone', tbl_cell_style)],
        [Paragraph('mno_reference', tbl_cell_style), Paragraph('VARCHAR(100)', tbl_cell_style), Paragraph('MNO-assigned reference number', tbl_cell_style)],
        [Paragraph('mno_status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('PENDING, SUBMITTED, PROCESSING, ACTIVE, FAILED, SUSPENDED, INACTIVE', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Subscription creation timestamp', tbl_cell_style)],
        [Paragraph('updated_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Last update timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(sub_data, [W * 0.20, W * 0.18, W * 0.62]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 8.</b> subscriptions table schema', caption_style))
    story.append(Spacer(1, 18))

    # mno_providers table
    story.append(add_heading('<b>6.7 mno_providers</b>', h3_style, 2))
    mno_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique provider identifier', tbl_cell_style)],
        [Paragraph('name', tbl_cell_style), Paragraph('VARCHAR(100)', tbl_cell_style), Paragraph('Provider name (Vodacom, Airtel, etc.)', tbl_cell_style)],
        [Paragraph('country', tbl_cell_style), Paragraph('VARCHAR(50)', tbl_cell_style), Paragraph('Country of operation', tbl_cell_style)],
        [Paragraph('api_endpoint', tbl_cell_style), Paragraph('VARCHAR(500)', tbl_cell_style), Paragraph('API base URL (nullable)', tbl_cell_style)],
        [Paragraph('api_key', tbl_cell_style), Paragraph('VARCHAR(500)', tbl_cell_style), Paragraph('Encrypted API key (nullable)', tbl_cell_style)],
        [Paragraph('integration_type', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('API, MANUAL, HYBRID', tbl_cell_style)],
        [Paragraph('contact_person', tbl_cell_style), Paragraph('VARCHAR(255)', tbl_cell_style), Paragraph('MNO account manager name', tbl_cell_style)],
        [Paragraph('contact_phone', tbl_cell_style), Paragraph('VARCHAR(20)', tbl_cell_style), Paragraph('MNO contact phone number', tbl_cell_style)],
        [Paragraph('is_active', tbl_cell_style), Paragraph('BOOLEAN', tbl_cell_style), Paragraph('Provider availability status', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Provider registration timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(mno_data, [W * 0.20, W * 0.18, W * 0.62]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 9.</b> mno_providers table schema', caption_style))
    story.append(Spacer(1, 18))

    # payments table
    story.append(add_heading('<b>6.8 payments</b>', h3_style, 2))
    pay_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique payment identifier', tbl_cell_style)],
        [Paragraph('subscription_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('Associated subscription', tbl_cell_style)],
        [Paragraph('amount', tbl_cell_style), Paragraph('DECIMAL(10,2)', tbl_cell_style), Paragraph('Payment amount in TZS', tbl_cell_style)],
        [Paragraph('method', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('M_PESA, TIGO_PESA, AIRTEL_MONEY, BANK_TRANSFER, CASH', tbl_cell_style)],
        [Paragraph('status', tbl_cell_style), Paragraph('ENUM', tbl_cell_style), Paragraph('PENDING, CONFIRMED, FAILED, REFUNDED', tbl_cell_style)],
        [Paragraph('reference', tbl_cell_style), Paragraph('VARCHAR(100)', tbl_cell_style), Paragraph('Transaction reference number', tbl_cell_style)],
        [Paragraph('paid_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Payment confirmation timestamp (nullable)', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Payment record creation timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(pay_data, [W * 0.20, W * 0.18, W * 0.62]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 10.</b> payments table schema', caption_style))
    story.append(Spacer(1, 18))

    # activity_logs table
    story.append(add_heading('<b>6.9 activity_logs</b>', h3_style, 2))
    log_data = [
        [Paragraph('<b>Column</b>', tbl_header_style),
         Paragraph('<b>Type</b>', tbl_header_style),
         Paragraph('<b>Description</b>', tbl_header_style)],
        [Paragraph('id', tbl_cell_style), Paragraph('UUID (PK)', tbl_cell_style), Paragraph('Unique log entry identifier', tbl_cell_style)],
        [Paragraph('user_id', tbl_cell_style), Paragraph('UUID (FK)', tbl_cell_style), Paragraph('User who performed the action', tbl_cell_style)],
        [Paragraph('action', tbl_cell_style), Paragraph('VARCHAR(100)', tbl_cell_style), Paragraph('Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)', tbl_cell_style)],
        [Paragraph('entity_type', tbl_cell_style), Paragraph('VARCHAR(50)', tbl_cell_style), Paragraph('Entity type (user, request, subscription, etc.)', tbl_cell_style)],
        [Paragraph('entity_id', tbl_cell_style), Paragraph('UUID', tbl_cell_style), Paragraph('ID of the affected entity', tbl_cell_style)],
        [Paragraph('details', tbl_cell_style), Paragraph('JSONB', tbl_cell_style), Paragraph('Additional context as JSON', tbl_cell_style)],
        [Paragraph('ip_address', tbl_cell_style), Paragraph('VARCHAR(45)', tbl_cell_style), Paragraph('Client IP address', tbl_cell_style)],
        [Paragraph('created_at', tbl_cell_style), Paragraph('TIMESTAMP', tbl_cell_style), Paragraph('Log entry timestamp', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(log_data, [W * 0.20, W * 0.18, W * 0.62]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 11.</b> activity_logs table schema', caption_style))
    story.append(Spacer(1, 18))

    # ==================== 7. USER ROLES & PERMISSIONS ====================
    story.append(add_heading('<b>7. User Roles & Permissions</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'The TunePoa platform implements a role-based access control (RBAC) system with four distinct roles, '
        'each designed to align with the operational responsibilities of different stakeholder groups. This '
        'granular access control ensures that users can only access the features and data relevant to their '
        'role, maintaining both security and operational clarity.'
    ))

    # Roles table
    roles_data = [
        [Paragraph('<b>Role</b>', tbl_header_style),
         Paragraph('<b>Scope</b>', tbl_header_style),
         Paragraph('<b>Key Capabilities</b>', tbl_header_style)],
        [Paragraph('<b>Super Admin</b>', tbl_cell_style),
         Paragraph('Full System', tbl_cell_style),
         Paragraph('Complete platform access including user management, role assignment, system configuration, '
                   'MNO provider setup, package management, full analytics, and all administrative functions. '
                   'Only Super Admins can create other Admin accounts.', tbl_cell_style)],
        [Paragraph('<b>Admin</b>', tbl_cell_style),
         Paragraph('Operations', tbl_cell_style),
         Paragraph('Manage service requests, review and approve submissions, manage subscriptions, process '
                   'MNO provisioning, view reports and analytics, handle payments. Cannot manage user roles '
                   'or system configuration.', tbl_cell_style)],
        [Paragraph('<b>Studio Manager</b>', tbl_cell_style),
         Paragraph('Production', tbl_cell_style),
         Paragraph('View service requests, manage recording sessions, upload and version audio files, '
                   'send recordings via WhatsApp for client verification, update recording and verification '
                   'statuses. Limited to production-related functions.', tbl_cell_style)],
        [Paragraph('<b>Business Owner</b>', tbl_cell_style),
         Paragraph('Self-Service', tbl_cell_style),
         Paragraph('Register and manage profile, submit service requests, upload scripts and reference '
                   'materials, view request and subscription status, approve or reject recordings, manage '
                   'payment methods, view invoices. Cannot access administrative functions.', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(roles_data, [W * 0.14, W * 0.12, W * 0.74]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 12.</b> User Roles and Permission Matrix', caption_style))
    story.append(Spacer(1, 18))

    story.append(bp(
        'The permission system is implemented at both the API route level and the UI component level. API '
        'routes use middleware to verify the authenticated user\'s role before processing requests, returning '
        'appropriate HTTP error codes (403 Forbidden) for unauthorized access attempts. On the frontend, '
        'navigation menus and UI elements are conditionally rendered based on the user\'s role, providing a '
        'clean interface that only shows relevant features. This dual-layer approach ensures security even '
        'in the event of client-side tampering.'
    ))
    story.append(bp(
        'The permission model is designed to support future expansion. As the platform grows, additional '
        'roles can be added (such as Sales Representative, Support Agent, or MNO Liaison) by defining new '
        'role constants and permission mappings. The system stores role permissions as a configuration object '
        'that can be updated without code changes, enabling rapid adaptation to evolving business needs. '
        'For the Tanzanian market, it is recommended that the Super Admin role be held by a maximum of '
        'two to three trusted individuals, with all administrative actions logged for accountability.'
    ))

    # ==================== 8. RECOMMENDED TECHNOLOGY STACK ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>8. Recommended Technology Stack</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'The technology stack for TunePoa has been selected to balance developer productivity, performance, '
        'scalability, and operational cost. Each technology choice is justified by its alignment with the '
        'platform requirements and the practical considerations of deploying and maintaining a SaaS product '
        'targeting the East African market.'
    ))

    # Tech stack table
    stack_data = [
        [Paragraph('<b>Layer</b>', tbl_header_style),
         Paragraph('<b>Technology</b>', tbl_header_style),
         Paragraph('<b>Justification</b>', tbl_header_style)],
        [Paragraph('Frontend Framework', tbl_cell_style),
         Paragraph('Next.js 16 + React', tbl_cell_style),
         Paragraph('Full-stack framework with server-side rendering, API routes, and built-in optimization. '
                   'Strong ecosystem and excellent developer experience. Single codebase for frontend and backend.', tbl_cell_style)],
        [Paragraph('Styling', tbl_cell_style),
         Paragraph('Tailwind CSS 4', tbl_cell_style),
         Paragraph('Utility-first CSS framework enabling rapid UI development with consistent design. '
                   'Highly customizable and performant with minimal CSS bundle size.', tbl_cell_style)],
        [Paragraph('UI Components', tbl_cell_style),
         Paragraph('shadcn/ui', tbl_cell_style),
         Paragraph('Pre-built, accessible React components built on Radix UI primitives. Fully customizable, '
                   'no vendor lock-in, and excellent documentation.', tbl_cell_style)],
        [Paragraph('Backend / API', tbl_cell_style),
         Paragraph('Next.js API Routes', tbl_cell_style),
         Paragraph('Serverless API routes within the Next.js framework. Simplifies deployment and eliminates '
                   'need for separate backend server. Supports middleware for authentication and validation.', tbl_cell_style)],
        [Paragraph('Database', tbl_cell_style),
         Paragraph('PostgreSQL', tbl_cell_style),
         Paragraph('Robust relational database with excellent JSON support (JSONB), full-text search, '
                   'and proven reliability. Free and open-source with strong community support.', tbl_cell_style)],
        [Paragraph('ORM', tbl_cell_style),
         Paragraph('Prisma ORM', tbl_cell_style),
         Paragraph('Type-safe database access with auto-generated TypeScript types. Schema-first approach '
                   'simplifies migrations and provides excellent developer tooling.', tbl_cell_style)],
        [Paragraph('Authentication', tbl_cell_style),
         Paragraph('NextAuth.js', tbl_cell_style),
         Paragraph('Flexible authentication library supporting multiple providers. Easy integration with '
                   'custom credential-based login and future social login expansion.', tbl_cell_style)],
        [Paragraph('File Storage', tbl_cell_style),
         Paragraph('Local / Amazon S3', tbl_cell_style),
         Paragraph('Start with local file storage for rapid development, migrate to S3 for production '
                   'scalability. S3 provides durability, CDN integration, and cost-effective storage.', tbl_cell_style)],
        [Paragraph('WhatsApp API', tbl_cell_style),
         Paragraph('WhatsApp Business API', tbl_cell_style),
         Paragraph('Official Meta API for business messaging. Provides reliable delivery, read receipts, '
                   'webhook callbacks, and template message support.', tbl_cell_style)],
        [Paragraph('Payments', tbl_cell_style),
         Paragraph('M-Pesa / Flutterwave', tbl_cell_style),
         Paragraph('M-Pesa is the dominant mobile money platform in Tanzania. Flutterwave provides a unified '
                   'API for multiple payment methods across Africa.', tbl_cell_style)],
        [Paragraph('Deployment', tbl_cell_style),
         Paragraph('Vercel + Managed DB', tbl_cell_style),
         Paragraph('Vercel provides zero-configuration deployment for Next.js with automatic scaling, '
                   'CDN, and preview deployments. Managed PostgreSQL via Supabase or Neon for database hosting.', tbl_cell_style)],
        [Paragraph('Monitoring', tbl_cell_style),
         Paragraph('Sentry + Custom Logs', tbl_cell_style),
         Paragraph('Sentry for error tracking and performance monitoring. Custom activity logging for '
                   'business audit trail and operational analytics.', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(stack_data, [W * 0.16, W * 0.20, W * 0.64]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 13.</b> Recommended Technology Stack', caption_style))
    story.append(Spacer(1, 18))

    story.append(bp(
        'This stack is particularly well-suited for a lean startup environment. The all-Next.js architecture '
        'minimizes the number of moving parts and allows a small development team to build and maintain the '
        'entire platform. TypeScript provides type safety that reduces bugs, while the Prisma ORM eliminates '
        'the boilerplate of raw SQL queries. The Vercel deployment model eliminates infrastructure management '
        'overhead, allowing the team to focus entirely on product development. For the East African market, '
        'this stack performs well even on lower-bandwidth connections thanks to Next.js server-side rendering '
        'and built-in optimization features. Estimated initial development time for the MVP is 8-12 weeks '
        'with a team of two full-stack developers.'
    ))

    # ==================== 9. IMPLEMENTATION ROADMAP ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>9. Implementation Roadmap</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'The implementation roadmap is structured into four phases, each building upon the previous to deliver '
        'increasing value while managing development risk. This phased approach allows TunePoa to begin '
        'generating revenue early while progressively building out the full platform vision.'
    ))

    story.append(add_heading('<b>9.1 Phase 1: Core Platform Foundation (Weeks 1-8)</b>', h2_style, 1))
    story.append(bp(
        'Phase 1 establishes the fundamental platform infrastructure and delivers the minimum viable product '
        'that enables business owners to register, submit service requests, and have their advertisements '
        'produced by the TunePoa studio team.'
    ))
    story.append(bul('<b>User Management:</b> Complete registration and authentication system with email '
                     'and phone verification. Role-based access control for all four user types. Profile '
                     'management interface for business owners. Admin user provisioning by Super Admins.'))
    story.append(bul('<b>Service Request Module:</b> Structured request form with all required fields '
                     '(business category, target audience, ad type, language, script). File upload capability '
                     'for reference materials. Status tracking visible to both business owners and admin users.'))
    story.append(bul('<b>Ad Management - Basic:</b> Script viewing and editing by studio managers. '
                     'Recording file upload and management. Basic status tracking (no WhatsApp integration yet). '
                     'Internal approval workflow with status transitions.'))
    story.append(bul('<b>Infrastructure:</b> Next.js project setup with TypeScript, Tailwind CSS, and '
                     'shadcn/ui. PostgreSQL database with Prisma schema for all core tables. Authentication '
                     'with NextAuth.js. Basic activity logging.'))
    story.append(bul('<b>Deliverables:</b> Functional platform where business owners can register, submit '
                     'requests, and track progress. Studio managers can view requests, manage recordings, '
                     'and update statuses. Admins can oversee operations.'))

    story.append(add_heading('<b>9.2 Phase 2: Subscription & WhatsApp Integration (Weeks 9-16)</b>', h2_style, 1))
    story.append(bp(
        'Phase 2 adds the commercial engine and WhatsApp communication capabilities that transform the platform '
        'from an internal workflow tool into a customer-facing SaaS product with integrated billing and '
        'client communication.'
    ))
    story.append(bul('<b>Package Management:</b> Package creation and configuration interface for administrators. '
                     'Package display and selection for business owners during subscription. Feature comparison '
                     'and pricing page.'))
    story.append(bul('<b>Subscription Lifecycle:</b> Subscription activation, tracking, renewal, and expiration '
                     'management. Automated renewal reminders (email and in-app). Grace period handling for '
                     'expired subscriptions.'))
    story.append(bul('<b>Payment Integration:</b> M-Pesa integration via Daraja API for mobile money payments. '
                     'Payment confirmation and tracking. Manual payment recording for cash and bank transfer methods. '
                     'Invoice generation.'))
    story.append(bul('<b>WhatsApp Integration:</b> WhatsApp Business API setup and template registration. '
                     'Automated recording dispatch to clients via WhatsApp. Delivery tracking and response '
                     'capture through webhook callbacks. Automated response analysis for approval detection.'))
    story.append(bul('<b>Deliverables:</b> Complete revenue-generating platform with integrated payments, '
                     'WhatsApp-based client communication, and automated subscription management.'))

    story.append(add_heading('<b>9.3 Phase 3: MNO Integration & Admin Dashboard (Weeks 17-24)</b>', h2_style, 1))
    story.append(bp(
        'Phase 3 connects the platform to the MNO ecosystem (initially via manual processes) and delivers '
        'the comprehensive admin dashboard needed for efficient operations management.'
    ))
    story.append(bul('<b>MNO Provider Management:</b> MNO provider configuration interface. Manual provisioning '
                     'workflow with status tracking. MNO contact management and escalation procedures.'))
    story.append(bul('<b>Provisioning Tracking:</b> Subscription-to-MNO status mapping. Automated alerts for '
                     'provisioning delays and failures. Status history and audit trail.'))
    story.append(bul('<b>Admin Dashboard:</b> Overview analytics with KPI tiles. Request management queue with '
                     'quick actions. Subscription monitoring with renewal alerts. Revenue tracking dashboard '
                     'with time-series charts.'))
    story.append(bul('<b>Basic Reporting:</b> Standard reports for subscriber growth, revenue, and MNO status. '
                     'CSV and PDF export capabilities. Scheduled report delivery to management.'))
    story.append(bul('<b>Deliverables:</b> Fully operational platform with MNO process tracking, comprehensive '
                     'admin tools, and operational reporting capabilities.'))

    story.append(add_heading('<b>9.4 Phase 4: Advanced Features & Scale (Weeks 25-36)</b>', h2_style, 1))
    story.append(bp(
        'Phase 4 focuses on advanced analytics, scalability improvements, and partner-facing capabilities '
        'that support the platform\'s growth beyond the initial launch.'
    ))
    story.append(bul('<b>Advanced Analytics:</b> Predictive churn analysis. Cohort retention analysis. '
                     'Package performance and conversion funnels. MNO reliability scoring and benchmarking.'))
    story.append(bul('<b>API for Partners:</b> Public REST API for authorized partners (agencies, resellers) '
                     'to integrate with TunePoa. API key management, rate limiting, and documentation.'))
    story.append(bul('<b>MNO API Integration:</b> Begin implementing API-based integration with MNOs that '
                     'have established technical partnerships. Adapter framework for provider-specific implementations.'))
    story.append(bul('<b>Mobile App (Future):</b>'))
    story.append(sbul('Progressive Web App (PWA) support for mobile access. Native mobile app evaluation '
                      'based on user demand and business requirements.'))
    story.append(bul('<b>Performance Optimization:</b> Database query optimization, CDN caching, and image '
                     'optimization. Load testing and performance benchmarking. Infrastructure scaling plan.'))
    story.append(bul('<b>Deliverables:</b> Enterprise-ready platform with advanced analytics, partner API, '
                     'MNO API integrations, and optimized performance for scale.'))

    # Roadmap summary table
    road_data = [
        [Paragraph('<b>Phase</b>', tbl_header_style),
         Paragraph('<b>Timeline</b>', tbl_header_style),
         Paragraph('<b>Focus</b>', tbl_header_style),
         Paragraph('<b>Key Milestone</b>', tbl_header_style)],
        [Paragraph('Phase 1', tbl_cell_center),
         Paragraph('Weeks 1-8', tbl_cell_center),
         Paragraph('Core Platform', tbl_cell_style),
         Paragraph('First service request to recording workflow operational', tbl_cell_style)],
        [Paragraph('Phase 2', tbl_cell_center),
         Paragraph('Weeks 9-16', tbl_cell_center),
         Paragraph('Billing + WhatsApp', tbl_cell_style),
         Paragraph('First paying subscriber with automated WhatsApp verification', tbl_cell_style)],
        [Paragraph('Phase 3', tbl_cell_center),
         Paragraph('Weeks 17-24', tbl_cell_center),
         Paragraph('MNO + Admin Tools', tbl_cell_style),
         Paragraph('End-to-end flow from request to active ringback tone', tbl_cell_style)],
        [Paragraph('Phase 4', tbl_cell_center),
         Paragraph('Weeks 25-36', tbl_cell_center),
         Paragraph('Advanced + Scale', tbl_cell_style),
         Paragraph('Partner API, advanced analytics, MNO API integration', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(road_data, [W * 0.10, W * 0.14, W * 0.24, W * 0.52]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 14.</b> Implementation Roadmap Summary', caption_style))
    story.append(Spacer(1, 18))

    # ==================== 10. RISK ANALYSIS & MITIGATION ====================
    story.append(Spacer(1, 18))
    story.append(add_heading('<b>10. Risk Analysis & Mitigation</b>', h1_style, 0))
    story.append(Spacer(1, 6))

    story.append(bp(
        'Every business venture carries inherent risks, and TunePoa is no exception. Understanding these '
        'risks and implementing proactive mitigation strategies is essential for long-term success. The '
        'following analysis identifies the key risk categories and outlines specific mitigation approaches '
        'tailored to the Tanzanian and East African market context.'
    ))

    story.append(add_heading('<b>10.1 MNO Dependency Risk</b>', h2_style, 1))
    story.append(bp(
        '<b>Risk Level: High.</b> TunePoa\'s core service depends on MNO cooperation for ringback tone '
        'provisioning. MNOs could change their policies, increase fees, discontinue ringback tone services, '
        'or prioritize their own competing solutions. In the Tanzanian market, MNOs have significant market '
        'power and may resist third-party intermediation of their value-added services.'
    ))
    story.append(bp('<b>Mitigation Strategies:</b>'))
    story.append(bul('Diversify across multiple MNOs to avoid dependency on any single provider. If one '
                     'MNO becomes difficult to work with, business can be redirected to others.'))
    story.append(bul('Build strong relationships with MNO business development teams, positioning TunePoa '
                     'as a revenue-generating partner rather than a competitor.'))
    story.append(bul('Maintain manual provisioning capability as a fallback even after API integration is '
                     'achieved, ensuring business continuity regardless of technical disruptions.'))
    story.append(bul('Explore formal partnership agreements with MNOs that provide contractual protections '
                     'and guaranteed access to ringback tone provisioning APIs.'))
    story.append(bul('Monitor the MNO regulatory environment in Tanzania through TCRA (Tanzania Communications '
                     'Regulatory Authority) developments that may affect value-added service policies.'))

    story.append(add_heading('<b>10.2 WhatsApp API Limitations</b>', h2_style, 1))
    story.append(bp(
        '<b>Risk Level: Medium.</b> The WhatsApp Business API has message template approval requirements, '
        'per-message costs, rate limits, and policy restrictions that could impact the verification workflow. '
        'Meta may change API pricing, template policies, or suspension criteria with limited notice.'
    ))
    story.append(bp('<b>Mitigation Strategies:</b>'))
    story.append(bul('Register multiple message templates with variations to reduce the risk of single-template '
                     'rejection disrupting operations.'))
    story.append(bul('Implement SMS and email as fallback communication channels for critical verifications '
                     'when WhatsApp delivery fails.'))
    story.append(bul('Monitor WhatsApp Business API pricing and policy changes proactively, maintaining '
                     'a budget buffer for potential cost increases.'))
    story.append(bul('Ensure all WhatsApp communications comply with Meta\'s Commerce and Business policies '
                     'to avoid account suspension.'))

    story.append(add_heading('<b>10.3 Payment Processing Risk</b>', h2_style, 1))
    story.append(bp(
        '<b>Risk Level: Medium.</b> Mobile money payment systems in Tanzania, while reliable, can experience '
        'downtime, delayed confirmation, and integration issues. Payment reconciliation errors could lead to '
        'incorrect subscription statuses and customer disputes. Currency fluctuation may affect pricing.'
    ))
    story.append(bp('<b>Mitigation Strategies:</b>'))
    story.append(bul('Support multiple payment methods (M-Pesa, Tigo Pesa, Airtel Money, bank transfer) '
                     'to avoid dependency on a single payment channel.'))
    story.append(bul('Implement automated payment reconciliation that cross-references platform records with '
                     'payment provider statements daily.'))
    story.append(bul('Maintain a manual payment recording capability as a fallback for periods when '
                     'automated payment integration is unavailable.'))
    story.append(bul('Price in Tanzanian Shillings to match local purchasing habits, with periodic pricing '
                     'reviews to account for inflation and currency movements.'))

    story.append(add_heading('<b>10.4 Data Security Risk</b>', h2_style, 1))
    story.append(bp(
        '<b>Risk Level: Medium.</b> The platform stores sensitive business information, phone numbers, and '
        'payment records. A data breach could result in financial loss, reputational damage, and regulatory '
        'penalties under Tanzania\'s data protection regulations.'
    ))
    story.append(bp('<b>Mitigation Strategies:</b>'))
    story.append(bul('Encrypt all sensitive data at rest (database encryption) and in transit (TLS/HTTPS). '
                     'Store API keys and MNO credentials using encrypted environment variables.'))
    story.append(bul('Implement regular security audits and penetration testing, particularly before each '
                     'major release.'))
    story.append(bul('Follow the principle of least privilege for database access and API permissions. '
                     'All administrative actions are logged for audit purposes.'))
    story.append(bul('Comply with Tanzania\'s Personal Data Protection Act and any future regulatory '
                     'requirements for data handling and breach notification.'))

    story.append(add_heading('<b>10.5 Scalability Risk</b>', h2_style, 1))
    story.append(bp(
        '<b>Risk Level: Low-Medium.</b> As the subscriber base grows, the platform must handle increased '
        'concurrent users, larger database volumes, more frequent MNO API calls, and higher WhatsApp messaging '
        'volumes. Performance degradation could harm the user experience and operational efficiency.'
    ))
    story.append(bp('<b>Mitigation Strategies:</b>'))
    story.append(bul('Design the database schema with appropriate indexing from the outset, based on expected '
                     'query patterns identified during the architecture phase.'))
    story.append(bul('Implement database connection pooling and query optimization to handle concurrent access.'))
    story.append(bul('Use Vercel\'s serverless architecture that automatically scales with demand, combined '
                     'with CDN caching for static assets and frequently accessed data.'))
    story.append(bul('Implement asynchronous processing for non-time-critical operations (report generation, '
                     'bulk notifications) using background job queues.'))
    story.append(bul('Conduct load testing at each phase milestone to identify and resolve performance '
                     'bottlenecks before they impact production users.'))

    # Risk summary table
    risk_data = [
        [Paragraph('<b>Risk Category</b>', tbl_header_style),
         Paragraph('<b>Level</b>', tbl_header_style),
         Paragraph('<b>Primary Mitigation</b>', tbl_header_style)],
        [Paragraph('MNO Dependency', tbl_cell_style),
         Paragraph('High', tbl_cell_center),
         Paragraph('Multi-MNO diversification, strong partnerships, manual fallback', tbl_cell_style)],
        [Paragraph('WhatsApp API Limits', tbl_cell_style),
         Paragraph('Medium', tbl_cell_center),
         Paragraph('Multi-template strategy, SMS/email fallback, policy compliance', tbl_cell_style)],
        [Paragraph('Payment Processing', tbl_cell_style),
         Paragraph('Medium', tbl_cell_center),
         Paragraph('Multi-channel payments, automated reconciliation, manual backup', tbl_cell_style)],
        [Paragraph('Data Security', tbl_cell_style),
         Paragraph('Medium', tbl_cell_center),
         Paragraph('Encryption, audits, least privilege, regulatory compliance', tbl_cell_style)],
        [Paragraph('Scalability', tbl_cell_style),
         Paragraph('Low-Medium', tbl_cell_center),
         Paragraph('Database optimization, serverless architecture, load testing', tbl_cell_style)],
    ]
    story.append(Spacer(1, 18))
    story.append(make_table(risk_data, [W * 0.20, W * 0.12, W * 0.68]))
    story.append(Spacer(1, 6))
    story.append(Paragraph('<b>Table 15.</b> Risk Assessment Summary', caption_style))
    story.append(Spacer(1, 18))

    # ==================== CLOSING ====================
    story.append(Spacer(1, 12))
    story.append(bp(
        'This document provides a comprehensive blueprint for the TunePoa platform, covering business '
        'architecture, technical design, operational workflows, and risk mitigation strategies. By following '
        'the phased implementation roadmap and leveraging the recommended technology stack, TunePoa is '
        'well-positioned to establish itself as the leading ringback tone advertising platform in Tanzania '
        'and expand across the East African market. The platform\'s modular architecture ensures that it can '
        'evolve with the business, incorporating new MNO partnerships, advanced analytics capabilities, '
        'and expanded service offerings as the market opportunity grows.'
    ))

    # ==================== BUILD ====================
    doc.multiBuild(story)
    print(f"PDF generated successfully: {output_path}")
    return output_path


if __name__ == '__main__':
    output = build_pdf()
    print(f"Output: {output}")
