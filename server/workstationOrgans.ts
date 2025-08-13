import { randomUUID } from "crypto";

// Workstation "Organs" - Modular AI-controlled components
interface WorkstationOrgan {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'active' | 'busy' | 'error';
  lastUsed: Date | null;
  config: any;
}

interface CanvasComposerConfig {
  templates: string[];
  brandColors: string[];
  exportFormats: string[];
  overlayLibrary: string[];
}

interface QRLabConfig {
  brandFrames: string[];
  vectorFormats: string[];
  customizations: any;
}

interface DocsConfig {
  templates: {
    brief: string[];
    script: string[];
    report: string[];
  };
  exportFormats: string[];
}

interface MediaPlayerConfig {
  supportedPlatforms: string[];
  checklistSync: boolean;
  autoPlay: boolean;
}

interface ShoppingListConfig {
  cartIntegrations: string[];
  quantityTracking: boolean;
  categorization: boolean;
}

interface MapsConfig {
  preferredProvider: 'apple' | 'google';
  defaultTransportMode: 'driving' | 'walking' | 'transit';
}

interface ProcurementConfig {
  vendors: {
    name: string;
    apiEndpoint?: string;
    categories: string[];
  }[];
  statusTracking: boolean;
  priceComparison: boolean;
}

class WorkstationOrganManager {
  private organs: Map<string, WorkstationOrgan> = new Map();

  constructor() {
    this.initializeDefaultOrgans();
  }

  // Canvas/Composer - Image editor + overlays + brand templates + export PNG/PDF
  createCanvasComposer(config: Partial<CanvasComposerConfig> = {}): string {
    const organId = randomUUID();
    const defaultConfig: CanvasComposerConfig = {
      templates: ['social-post', 'presentation-slide', 'infographic', 'logo-design'],
      brandColors: ['#6366f1', '#8b5cf6', '#06b6d4'], // Neural Blue, Cyber Purple, Electric Cyan
      exportFormats: ['PNG', 'PDF', 'SVG', 'JPG'],
      overlayLibrary: ['neural-network', 'geometric-shapes', 'gradients', 'particles'],
      ...config
    };

    const organ: WorkstationOrgan = {
      id: organId,
      name: 'Canvas/Composer',
      type: 'canvas-composer',
      status: 'idle',
      lastUsed: null,
      config: defaultConfig
    };

    this.organs.set(organId, organ);
    return organId;
  }

  // QR Lab - Branded QR creation + frame overlays + vector export
  createQRLab(config: Partial<QRLabConfig> = {}): string {
    const organId = randomUUID();
    const defaultConfig: QRLabConfig = {
      brandFrames: ['neural-border', 'gradient-ring', 'tech-frame', 'minimal-clean'],
      vectorFormats: ['SVG', 'PDF', 'EPS'],
      customizations: {
        colors: ['#6366f1', '#8b5cf6', '#06b6d4'],
        errorCorrection: 'M', // Medium (15%)
        quietZone: 4,
        logoEmbedding: true
      },
      ...config
    };

    const organ: WorkstationOrgan = {
      id: organId,
      name: 'QR Lab',
      type: 'qr-lab',
      status: 'idle',
      lastUsed: null,
      config: defaultConfig
    };

    this.organs.set(organId, organ);
    return organId;
  }

  // Docs - Brief/script generator (DOCX/PDF/MD) with templates
  createDocsGenerator(config: Partial<DocsConfig> = {}): string {
    const organId = randomUUID();
    const defaultConfig: DocsConfig = {
      templates: {
        brief: ['project-brief', 'creative-brief', 'technical-spec', 'meeting-agenda'],
        script: ['video-script', 'presentation-script', 'podcast-outline', 'training-material'],
        report: ['status-report', 'analysis-report', 'proposal', 'executive-summary']
      },
      exportFormats: ['DOCX', 'PDF', 'MD', 'HTML'],
      ...config
    };

    const organ: WorkstationOrgan = {
      id: organId,
      name: 'Docs Generator',
      type: 'docs-generator',
      status: 'idle',
      lastUsed: null,
      config: defaultConfig
    };

    this.organs.set(organId, organ);
    return organId;
  }

  // Media Player - YouTube embed with step-checklist sync
  createMediaPlayer(config: Partial<MediaPlayerConfig> = {}): string {
    const organId = randomUUID();
    const defaultConfig: MediaPlayerConfig = {
      supportedPlatforms: ['youtube', 'vimeo', 'local-files'],
      checklistSync: true,
      autoPlay: false,
      ...config
    };

    const organ: WorkstationOrgan = {
      id: organId,
      name: 'Media Player',
      type: 'media-player',
      status: 'idle',
      lastUsed: null,
      config: defaultConfig
    };

    this.organs.set(organId, organ);
    return organId;
  }

  // Shopping List - Tappable checkboxes + quantities + notes; "Add to Cart" links
  createShoppingList(config: Partial<ShoppingListConfig> = {}): string {
    const organId = randomUUID();
    const defaultConfig: ShoppingListConfig = {
      cartIntegrations: ['amazon', 'instacart', 'walmart', 'target', 'heb'],
      quantityTracking: true,
      categorization: true,
      ...config
    };

    const organ: WorkstationOrgan = {
      id: organId,
      name: 'Shopping List',
      type: 'shopping-list',
      status: 'idle',
      lastUsed: null,
      config: defaultConfig
    };

    this.organs.set(organId, organ);
    return organId;
  }

  // Maps - One-tap directions deep link (Apple/Google)
  createMapsOrgan(config: Partial<MapsConfig> = {}): string {
    const organId = randomUUID();
    const defaultConfig: MapsConfig = {
      preferredProvider: 'google',
      defaultTransportMode: 'driving',
      ...config
    };

    const organ: WorkstationOrgan = {
      id: organId,
      name: 'Maps',
      type: 'maps',
      status: 'idle',
      lastUsed: null,
      config: defaultConfig
    };

    this.organs.set(organId, organ);
    return organId;
  }

  // Procurement - Multi-vendor links, status tracking (needed→ordered→received)
  createProcurementOrgan(config: Partial<ProcurementConfig> = {}): string {
    const organId = randomUUID();
    const defaultConfig: ProcurementConfig = {
      vendors: [
        { name: 'Amazon', categories: ['electronics', 'books', 'general'] },
        { name: 'HEB', categories: ['groceries', 'pharmacy', 'fuel'] },
        { name: 'Instacart', categories: ['groceries', 'delivery'] },
        { name: 'Home Depot', categories: ['hardware', 'tools', 'materials'] },
        { name: 'Best Buy', categories: ['electronics', 'tech', 'appliances'] }
      ],
      statusTracking: true,
      priceComparison: true,
      ...config
    };

    const organ: WorkstationOrgan = {
      id: organId,
      name: 'Procurement',
      type: 'procurement',
      status: 'idle',
      lastUsed: null,
      config: defaultConfig
    };

    this.organs.set(organId, organ);
    return organId;
  }

  // Organ Management
  activateOrgan(organId: string): boolean {
    const organ = this.organs.get(organId);
    if (organ) {
      organ.status = 'active';
      organ.lastUsed = new Date();
      return true;
    }
    return false;
  }

  deactivateOrgan(organId: string): boolean {
    const organ = this.organs.get(organId);
    if (organ) {
      organ.status = 'idle';
      return true;
    }
    return false;
  }

  getOrgansByType(type: string): WorkstationOrgan[] {
    return Array.from(this.organs.values()).filter(organ => organ.type === type);
  }

  getAllOrgans(): WorkstationOrgan[] {
    return Array.from(this.organs.values());
  }

  getActiveOrgans(): WorkstationOrgan[] {
    return Array.from(this.organs.values()).filter(organ => organ.status === 'active');
  }

  updateOrganConfig(organId: string, config: any): boolean {
    const organ = this.organs.get(organId);
    if (organ) {
      organ.config = { ...organ.config, ...config };
      return true;
    }
    return false;
  }

  // Voice/QR Activation
  triggerOrganByVoice(voiceCommand: string): string | null {
    const commands = {
      'canvas': 'canvas-composer',
      'design': 'canvas-composer',
      'qr': 'qr-lab',
      'code': 'qr-lab',
      'docs': 'docs-generator',
      'document': 'docs-generator',
      'media': 'media-player',
      'video': 'media-player',
      'shopping': 'shopping-list',
      'shop': 'shopping-list',
      'maps': 'maps',
      'directions': 'maps',
      'procurement': 'procurement',
      'order': 'procurement'
    };

    const command = voiceCommand.toLowerCase();
    for (const [trigger, type] of Object.entries(commands)) {
      if (command.includes(trigger)) {
        const organs = this.getOrgansByType(type);
        if (organs.length > 0) {
          this.activateOrgan(organs[0].id);
          return organs[0].id;
        }
      }
    }

    return null;
  }

  generateQRForOrgan(organId: string): string {
    // Generate QR code data for quick organ activation
    const organ = this.organs.get(organId);
    if (organ) {
      return JSON.stringify({
        action: 'activate_organ',
        organId: organId,
        organType: organ.type,
        timestamp: Date.now()
      });
    }
    return '';
  }

  private initializeDefaultOrgans(): void {
    // Create one instance of each organ type
    this.createCanvasComposer();
    this.createQRLab();
    this.createDocsGenerator();
    this.createMediaPlayer();
    this.createShoppingList();
    this.createMapsOrgan();
    this.createProcurementOrgan();
  }
}

export const workstationOrganManager = new WorkstationOrganManager();
export type { WorkstationOrgan };