import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsappService, StatusResponse, CampaignProgress } from './services/whatsapp.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  status: StatusResponse = {
    connected: false,
    qrCode: null,
    campaign: { total: 0, sent: 0, currentNumber: null, inProgress: false }
  };
  
  description: string = `Ter consistência no Bac Bo não é sorte, é leitura de padrões e gerenciamento rigoroso de banca. Se você quer parar de adivinhar jogadas e começar a operar com estratégia, conheça a nossa ferramenta:
✅ Zero Delay: Entradas em milissegundos para você nunca mais perder o tempo da mesa
✅ Leitura Algorítmica Avançada: Análise contínua das últimas rodadas e tendências reais
✅ Gerenciador de Metas Diárias: Calcule e acompanhe o progresso dos seus resultados dentro da própria plataforma
Chega de arriscar no escuro tentando recuperar prejuízo por impulso.
🌐 Entre na plataforma oficial:
👉 https://www.sinaiscassino.com.br

⚠️ Aviso Legal: Apostas não são investimentos. Jogue com responsabilidade. Proibido para menores de 18 anos.`;
  link: string = 'https://www.sinaiscassino.com.br';
  selectedFiles: File[] = [];
  
  sending: boolean = false;
  private statusSub?: Subscription;

  constructor(private waService: WhatsappService) {}

  ngOnInit() {
    this.checkStatus();
    // Poll status every 3 seconds
    this.statusSub = interval(3000).subscribe(() => {
      this.checkStatus();
    });
  }

  ngOnDestroy() {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  checkStatus() {
    this.waService.getStatus().subscribe({
      next: (res) => {
        this.status = res;
      },
      error: (err) => console.error('Failed to get status', err)
    });
  }

  onFileSelected(event: any) {
    const newFiles = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
  }

  clearFiles(fileInput: HTMLInputElement) {
    this.selectedFiles = [];
    fileInput.value = '';
  }

  sendCampaign() {
    if (!this.status.connected) {
      alert('WhatsApp não está conectado!');
      return;
    }
    
    if (this.status.campaign.inProgress) {
      alert('Uma campanha já está em andamento!');
      return;
    }

    this.sending = true;
    const formData = new FormData();
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });
    if (this.description) {
      formData.append('description', this.description);
    }
    if (this.link) {
      formData.append('link', this.link);
    }

    this.waService.sendCampaign(formData).subscribe({
      next: (res) => {
        console.log(res);
        this.sending = false;
        alert('Campanha iniciada com sucesso!');
        this.checkStatus();
      },
      error: (err) => {
        console.error(err);
        this.sending = false;
        alert('Erro ao iniciar a campanha: ' + (err.error?.error || err.message));
      }
    });
  }

  getQrCodeUrl(): string {
    if (!this.status.qrCode) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.status.qrCode)}`;
  }
}
