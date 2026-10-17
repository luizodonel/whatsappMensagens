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
  
  numbers: string = '';
  message: string = '';
  selectedFiles: File[] = [];
  
  sending: boolean = false;
  private statusSub?: Subscription;

  constructor(private waService: WhatsappService) {}

  get parsedNumbers(): string[] {
    if (!this.numbers) return [];
    return this.numbers
      .split(/[,;\n\r]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
  }

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
      alert('Um envio já está em andamento!');
      return;
    }

    const count = this.parsedNumbers.length;
    if (count === 0) {
      alert('Por favor, adicione pelo menos um número de telefone para enviar.');
      return;
    }

    if (!this.message.trim() && this.selectedFiles.length === 0) {
      alert('Por favor, digite uma mensagem ou selecione pelo menos uma imagem para enviar.');
      return;
    }

    const confirmSend = confirm(`Deseja realmente iniciar o envio para ${count} número(s)?\n\nNenhuma mensagem é disparada sem o seu clique e confirmação.`);
    if (!confirmSend) {
      return;
    }

    this.sending = true;
    const formData = new FormData();
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('numbers', this.numbers);
    formData.append('message', this.message);

    this.waService.sendCampaign(formData).subscribe({
      next: (res) => {
        console.log(res);
        this.sending = false;
        alert(`Disparo iniciado com sucesso para ${count} contato(s)!`);
        this.checkStatus();
      },
      error: (err) => {
        console.error(err);
        this.sending = false;
        alert('Erro ao iniciar o envio: ' + (err.error?.error || err.message));
      }
    });
  }

  getQrCodeUrl(): string {
    if (!this.status.qrCode) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.status.qrCode)}`;
  }
}
