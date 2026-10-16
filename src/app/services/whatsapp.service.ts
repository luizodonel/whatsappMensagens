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
  qrCode: string | null;
  campaign: CampaignProgress;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.apiUrl}/status`);
  }

  sendCampaign(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, formData);
  }
}
