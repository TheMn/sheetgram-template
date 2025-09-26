export interface Course {
    code: string;
    abbr: string;
    teachers: string[];
    telegram_thread_id: number;
}

export interface Program {
    id: number;
    title: string;
    coordinator: string;
    telegram_thread_id: number;
}

export const CATALOG: {
    program: Program;
    courses: Record<number, Course>;
} = {
    program: {
        id: 11945,
        title: "Digital Humanities - Interactive Systems and Digital Media (Master)",
        coordinator: "Ilaria Torre",
        telegram_thread_id: 1466
    },
    courses: {
        111193: { code: "DATA SEMANTICS FOR ARTS", abbr: "DSA", teachers: ["Ilaria Torre"], telegram_thread_id: 1441 },
        80158: { code: "HUMAN COMPUTER INTERACTION", abbr: "HCI", teachers: ["Antonio Camurri"], telegram_thread_id: 1466 },
        86798: { code: "MACHINE LEARNING AND DEEP LEARNING", abbr: "MLDL", teachers: ["Luca Oneto", "Davide Anguita"], telegram_thread_id: 1452 },
        90689: { code: "IMAGE AND VIDEO PROCESSING", abbr: "IVP", teachers: ["Eleonora Ceccaldi", "Annalisa Barla"], telegram_thread_id: 1444 },
        90690: { code: "SOUND AND MUSIC COMPUTING", abbr: "SMC", teachers: ["Gualtiero Volpe"], telegram_thread_id: 1466 },
        90621: { code: "MULTIMODAL NARRATIVES", abbr: "MN", teachers: ["Nicola Ferrari"], telegram_thread_id: 1466 },
        111363: { code: "PSYCHOLOGY OF PERCEPTION", abbr: "POP", teachers: ["Eleonora Ceccaldi"], telegram_thread_id: 1454 },
        104904: { code: "RESEARCH METHODS IN SOCIAL SCIENCE", abbr: "RMSS", teachers: ["Enrico By Bella"], telegram_thread_id: 1466 },
        118898: { code: "DESIGN AND NARRATIVE", abbr: "DN", teachers: [], telegram_thread_id: 1466 },
        83839: { code: "INTERACTION DESIGN", abbr: "ID", teachers: ["Federica Delprino", "Maria Morozzo"], telegram_thread_id: 1466 },
        83847: { code: "GRAPHICS AND MULTIMEDIA", abbr: "GnM", teachers: ["Massimo Malagugini"], telegram_thread_id: 1466 },
        90619: { code: "WRITING FOR DIGITAL MEDIA", abbr: "WDM", teachers: ["Jacqueline Visconti", "Manuela Manfredini"], telegram_thread_id: 1466 },
        111194: { code: "VISUAL SEMIOTICS", abbr: "VS", teachers: ["Rocco Antonucci"], telegram_thread_id: 1456 },
        118885: { code: "MEDIA CONTENT PRODUCTION", abbr: "MCP", teachers: ["Saverio Iacono"], telegram_thread_id: 1449 }
    }
};