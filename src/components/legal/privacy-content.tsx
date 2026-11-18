import type { Locale } from "@/lib/i18n/dictionaries";
import { siteConfig } from "@/lib/site-config";
import { L } from "@/lib/i18n/locale-path";

/**
 * Privacy policy body, EN + RU. Practical and honest, written for Thailand's
 * PDPA: what we collect, why, who sees it, how long we keep it, and the rights
 * a data subject has. Pre-incorporation note is deliberate — the Thai entity is
 * being formed; the policy updates with the registered company name.
 *
 * Copy lives here (not a CMS) so it is version-controlled and reviewable, and
 * is rendered by both /privacy and /ru/privacy.
 */
type Section = { h: string; body: string[] };

const EN: Section[] = [
  {
    h: "Who we are",
    body: [
      "Right Way Phangan Group is a real estate agency operating on Koh Phangan, Thailand. The business is in the process of formal incorporation in Thailand; this policy will be updated with the registered company details once that is complete. Until then, privacy requests are handled through the contact below.",
    ],
  },
  {
    h: "What we collect",
    body: [
      "Enquiry details you give us — name, the messenger or email you contact us through, phone number if you share it, and the content of your message — when you submit a form or write to us on Telegram, WhatsApp or email.",
      "Property and owner details for listings — including a seller's name and contact — when we take a property into our catalogue. This is kept internal and is never published on the website.",
      "Basic, aggregated website analytics (pages visited, approximate region, device type) to understand how the site is used. We do not build advertising profiles of individuals on this site.",
    ],
  },
  {
    h: "Why we use it",
    body: [
      "To reply to your enquiry, match you with suitable properties, and carry a transaction through due diligence and closing. To contact property owners about listing and selling their property. To improve the website. We rely on your consent (when you contact us) and on our legitimate interest in running the agency.",
    ],
  },
  {
    h: "Who sees it",
    body: [
      "Our own systems (a customer database hosted on our infrastructure) and the people working on your enquiry. For a transaction, the lawyer handling due diligence, and where strictly necessary, counterparties such as the Land Office. Messaging platforms you choose to contact us through (Telegram, WhatsApp) process the message under their own terms. We do not sell your data.",
    ],
  },
  {
    h: "How long we keep it",
    body: [
      "Enquiries that do not lead anywhere are kept only as long as useful and then removed. Records connected to a completed transaction are kept for at least seven years, as Thai tax and property law requires.",
    ],
  },
  {
    h: "Your rights",
    body: [
      "You can ask us what personal data we hold about you, to correct it, or to delete it, and you can withdraw consent at any time. Write to the contact below and we will action it. If you are unsatisfied you may complain to Thailand's Personal Data Protection Committee.",
    ],
  },
  {
    h: "Contact",
    body: [
      `For any privacy request, email ${siteConfig.contact.email}.`,
    ],
  },
];

const RU: Section[] = [
  {
    h: "Кто мы",
    body: [
      "Right Way Phangan Group — агентство недвижимости, работающее на острове Панган (Таиланд). Компания находится в процессе официальной регистрации в Таиланде; после её завершения политика будет дополнена реквизитами зарегистрированного юрлица. До этого запросы, связанные с персональными данными, обрабатываются через контакт, указанный ниже.",
    ],
  },
  {
    h: "Что мы собираем",
    body: [
      "Данные обращения, которые вы сообщаете: имя, мессенджер или email, через который вы пишете, телефон (если вы его указываете) и текст сообщения — когда вы отправляете форму или пишете нам в Telegram, WhatsApp или на почту.",
      "Данные об объекте и собственнике для каталога — включая имя и контакт продавца — когда мы принимаем объект в работу. Это хранится только внутри и никогда не публикуется на сайте.",
      "Базовую обезличенную веб-аналитику (посещённые страницы, примерный регион, тип устройства), чтобы понимать, как используется сайт. Рекламные профили на отдельных людей на этом сайте мы не строим.",
    ],
  },
  {
    h: "Зачем мы это используем",
    body: [
      "Чтобы ответить на ваше обращение, подобрать подходящие объекты и провести сделку через проверку и закрытие. Чтобы связываться с собственниками по поводу размещения и продажи их объектов. Чтобы улучшать сайт. Основание — ваше согласие (когда вы к нам обращаетесь) и наш законный интерес в работе агентства.",
    ],
  },
  {
    h: "Кто видит данные",
    body: [
      "Наши собственные системы (база клиентов на нашей инфраструктуре) и сотрудники, работающие с вашим обращением. По сделке — юрист, ведущий проверку, и, где это строго необходимо, контрагенты, например Земельный офис. Мессенджеры, через которые вы пишете (Telegram, WhatsApp), обрабатывают сообщение по своим условиям. Мы не продаём ваши данные.",
    ],
  },
  {
    h: "Сколько мы храним",
    body: [
      "Обращения, которые ни к чему не привели, хранятся лишь столько, сколько это полезно, и затем удаляются. Данные, связанные с завершённой сделкой, хранятся не менее семи лет — этого требует тайское налоговое и имущественное законодательство.",
    ],
  },
  {
    h: "Ваши права",
    body: [
      "Вы можете запросить, какие персональные данные о вас у нас есть, исправить их или удалить, а также отозвать согласие в любой момент. Напишите на контакт ниже — мы это сделаем. При несогласии вы вправе обратиться с жалобой в Комитет по защите персональных данных Таиланда (PDPC).",
    ],
  },
  {
    h: "Контакт",
    body: [
      `По любым вопросам о данных пишите на ${siteConfig.contact.email}.`,
    ],
  },
];

const TH: Section[] = [
  {
    h: "เราคือใคร",
    body: [
      "Right Way Phangan Group เป็นบริษัทนายหน้าอสังหาริมทรัพย์ที่ดำเนินธุรกิจบนเกาะพะงัน ประเทศไทย ขณะนี้อยู่ระหว่างการจดทะเบียนนิติบุคคลอย่างเป็นทางการในประเทศไทย นโยบายนี้จะได้รับการปรับปรุงพร้อมรายละเอียดบริษัทที่จดทะเบียนเมื่อดำเนินการเสร็จสิ้น ในระหว่างนี้ คำขอเกี่ยวกับความเป็นส่วนตัวจะดำเนินการผ่านช่องทางติดต่อด้านล่าง",
    ],
  },
  {
    h: "ข้อมูลที่เราเก็บรวบรวม",
    body: [
      "รายละเอียดการสอบถามที่คุณให้ไว้ ได้แก่ ชื่อ แอปส่งข้อความหรืออีเมลที่คุณใช้ติดต่อเรา หมายเลขโทรศัพท์หากคุณแจ้ง และเนื้อหาข้อความ เมื่อคุณส่งแบบฟอร์มหรือติดต่อเราทาง Telegram, WhatsApp หรืออีเมล",
      "รายละเอียดทรัพย์และเจ้าของสำหรับประกาศ รวมถึงชื่อและช่องทางติดต่อของผู้ขาย เมื่อเรารับทรัพย์เข้าสู่รายการของเรา ข้อมูลนี้เก็บไว้ภายในเท่านั้นและไม่เผยแพร่บนเว็บไซต์",
      "ข้อมูลวิเคราะห์เว็บไซต์พื้นฐานแบบรวม (หน้าที่เข้าชม ภูมิภาคโดยประมาณ ประเภทอุปกรณ์) เพื่อทำความเข้าใจการใช้งานเว็บไซต์ เราไม่สร้างโปรไฟล์โฆษณาของบุคคลบนเว็บไซต์นี้",
    ],
  },
  {
    h: "เหตุผลที่เราใช้ข้อมูล",
    body: [
      "เพื่อตอบคำถามของคุณ คัดเลือกทรัพย์ที่เหมาะสม และดำเนินธุรกรรมผ่านการตรวจสอบสถานะ (Due Diligence) จนถึงการโอน เพื่อติดต่อเจ้าของทรัพย์เกี่ยวกับการลงประกาศและการขายทรัพย์ และเพื่อปรับปรุงเว็บไซต์ ฐานทางกฎหมายที่เราใช้คือความยินยอมของคุณ (เมื่อคุณติดต่อเรา) และประโยชน์โดยชอบด้วยกฎหมายของเราในการดำเนินธุรกิจนายหน้า",
    ],
  },
  {
    h: "ผู้ที่เห็นข้อมูล",
    body: [
      "ระบบของเราเอง (ฐานข้อมูลลูกค้าที่โฮสต์บนโครงสร้างพื้นฐานของเรา) และบุคลากรที่ดูแลคำขอของคุณ สำหรับธุรกรรม ได้แก่ ทนายความที่ดำเนินการตรวจสอบสถานะ และหากจำเป็นอย่างยิ่ง คู่สัญญาหรือหน่วยงาน เช่น สำนักงานที่ดิน แพลตฟอร์มส่งข้อความที่คุณเลือกใช้ติดต่อเรา (Telegram, WhatsApp) ประมวลผลข้อความตามเงื่อนไขของแพลตฟอร์มนั้น เราไม่ขายข้อมูลของคุณ",
    ],
  },
  {
    h: "ระยะเวลาการเก็บรักษา",
    body: [
      "คำถามที่ไม่ได้นำไปสู่ธุรกรรมจะเก็บไว้เท่าที่ยังมีประโยชน์แล้วจึงลบออก ข้อมูลที่เกี่ยวข้องกับธุรกรรมที่เสร็จสมบูรณ์จะเก็บไว้อย่างน้อยเจ็ดปีตามที่กฎหมายภาษีและกฎหมายอสังหาริมทรัพย์ของไทยกำหนด",
    ],
  },
  {
    h: "สิทธิของคุณ",
    body: [
      "คุณสามารถขอทราบว่าเราเก็บข้อมูลส่วนบุคคลใดของคุณ ขอแก้ไข หรือขอลบข้อมูล และสามารถถอนความยินยอมได้ทุกเมื่อ ติดต่อเราตามช่องทางด้านล่างแล้วเราจะดำเนินการให้ หากคุณไม่พอใจ คุณมีสิทธิร้องเรียนต่อคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC) ของประเทศไทย",
    ],
  },
  {
    h: "ติดต่อ",
    body: [
      `สำหรับคำขอเกี่ยวกับความเป็นส่วนตัว กรุณาอีเมลถึง ${siteConfig.contact.email}`,
    ],
  },
];

export function PrivacyContent({ locale = "en" }: { locale?: Locale }) {
  const sections = L(locale, { en: EN, ru: RU, th: TH });
  const updated = L(locale, { en: "Last updated: 13 June 2026", ru: "Обновлено: 13 июня 2026", th: "ปรับปรุงล่าสุด: 13 มิถุนายน 2026" });
  return (
    <section className="container-prose py-12 md:py-16">
      <p className="text-sm text-forest-500/60">{updated}</p>
      <div className="mt-8 space-y-10">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="font-serif text-2xl text-forest-900">{s.h}</h2>
            {s.body.map((para, i) => (
              <p
                key={i}
                className="mt-3 max-w-prose text-base leading-relaxed text-forest-500/75"
              >
                {para}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
