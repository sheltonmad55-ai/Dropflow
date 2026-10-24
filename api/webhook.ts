import type { Request, Response } from 'express';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default async function handler(req: any, res: any) {
  // Allow POST requests and simple GET for health check
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'DroopFlow EscalePay Webhook Endpoint Active' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    console.log('[EscalePay Webhook] Received payload:', JSON.stringify(body));

    // Support multiple field naming variants from EscalePay and payment gateways
    const status = (
      body.status ||
      body.event ||
      body.type ||
      body.data?.status ||
      body.data?.event ||
      ''
    ).toString().toLowerCase();

    const email = (
      body.customer?.email ||
      body.client?.email ||
      body.buyer?.email ||
      body.email ||
      body.data?.customer?.email ||
      body.data?.email ||
      ''
    ).toString().trim().toLowerCase();

    const productId = (
      body.product?.id ||
      body.product_id ||
      body.order?.product_id ||
      body.data?.product_id ||
      '9729350'
    ).toString();

    const name = (
      body.customer?.name ||
      body.client?.name ||
      body.buyer?.name ||
      body.name ||
      ''
    ).toString().trim();

    if (!email) {
      console.warn('[EscalePay Webhook] No customer email identified in payload.');
      return res.status(400).json({ error: 'No email found in webhook payload' });
    }

    // Check for payment approval / confirmation events
    const isApproved = 
      status.includes('confirm') || 
      status.includes('aprov') || 
      status.includes('paid') || 
      status.includes('complete') || 
      status.includes('success') ||
      status === 'active' ||
      status === ''; // If EscalePay sends default payload without status, treat product checkout as confirmed

    if (isApproved) {
      console.log(`[EscalePay Webhook] Activating Pro subscription for: ${email}`);

      // 1. Record subscription in paid_subscribers collection
      const subscriberRef = doc(db, 'paid_subscribers', email.replace(/[^a-zA-Z0-9_@.-]/g, '_'));
      await setDoc(subscriberRef, {
        email,
        name: name || null,
        plano: 'pro',
        status: 'pro',
        product_id: productId,
        checkout_url: 'https://checkout.escalepay.com/9729350',
        valor: body.amount || body.valor || 297,
        moeda: 'MZN',
        data_aprovacao: new Date().toISOString(),
        origem: 'escalepay',
        raw_payload: body
      }, { merge: true });

      // 2. If the user already has a profile registered, immediately update their profile to 'pro'
      try {
        const profilesQuery = query(collection(db, 'profiles'), where('email', '==', email));
        const profilesSnap = await getDocs(profilesQuery);

        if (!profilesSnap.empty) {
          for (const pDoc of profilesSnap.docs) {
            await updateDoc(doc(db, 'profiles', pDoc.id), {
              plano: 'pro',
              plano_atualizado_em: new Date().toISOString()
            });
            console.log(`[EscalePay Webhook] Profile ${pDoc.id} upgraded to PRO`);
          }
        }
      } catch (profileErr) {
        console.warn('[EscalePay Webhook] Warning querying profiles by email:', profileErr);
      }

      return res.status(200).json({
        success: true,
        message: `Assinatura Pro do DroopFlow ativada para ${email}`,
        email,
        plano: 'pro'
      });
    }

    // Handle cancellation / refunds
    if (status.includes('cancel') || status.includes('refund') || status.includes('reembols')) {
      const subscriberRef = doc(db, 'paid_subscribers', email.replace(/[^a-zA-Z0-9_@.-]/g, '_'));
      await setDoc(subscriberRef, {
        email,
        plano: 'gratis',
        status: 'canceled',
        data_cancelamento: new Date().toISOString()
      }, { merge: true });

      return res.status(200).json({
        success: true,
        message: `Assinatura cancelada para ${email}`
      });
    }

    return res.status(200).json({
      received: true,
      status,
      message: 'Webhook recebido mas nenhum evento acionador detectado'
    });
  } catch (error: any) {
    console.error('[EscalePay Webhook] Error processing webhook:', error);
    return res.status(500).json({
      error: 'Internal server error processing webhook',
      details: error?.message || error
    });
  }
}
