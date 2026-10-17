import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CampaignProgress {
  total: number;
  sent: number;
  currentNumber: string | null;
  inProgress: boolean;
}

export interface StatusResponse {
  connected: boolean;
  authenticated?: boolean;
  loadingPercent?: number | null;
  qrCode: string | null;
  campaign: CampaignProgress;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private apiUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://whatsappapi.luizodonel.cloud/api';

  constructor(private http: HttpClient) {}

  getStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.apiUrl}/status`);
  }

  sendCampaign(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, formData);
  }
}
