"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  QrCode
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import { SHA256 } from 'js-sha256';
import QRCode from 'react-qr-code';

interface SecurityPanelProps {
  encryptionEnabled: boolean;
  onEncryptionToggle: (enabled: boolean) => void;
  onKeyGenerated: (key: string) => void;
  onAuditLog: (action: string, details: any) => void;
}

export function SecurityPanel({
  encryptionEnabled,
  onEncryptionToggle,
  onKeyGenerated,
  onAuditLog
}: SecurityPanelProps) {
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keywordFilters, setKeywordFilters] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [auditTrail, setAuditTrail] = useState<Array<{
    timestamp: Date;
    action: string;
    hash: string;
    details: any;
  }>>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');

  console.log('SecurityPanel: Component rendered', { encryptionEnabled, keywordFilters });

  useEffect(() => {
    // Generate 2FA QR code
    if (twoFactorEnabled) {
      const secret = CryptoJS.lib.WordArray.random(128/8).toString();
      const qrData = `otpauth://totp/Syntra?secret=${secret}&issuer=Syntra`;
      setQrCode(qrData);
    }
  }, [twoFactorEnabled]);

  const generateSecureKey = () => {
    // Generate a cryptographically secure key
    const key = CryptoJS.lib.WordArray.random(256/8).toString();
    setEncryptionKey(key);
    onKeyGenerated(key);
    
    // Add to audit trail
    addToAuditTrail('KEY_GENERATED', { keyLength: key.length });
    console.log('SecurityPanel: New encryption key generated');
  };

  const addToAuditTrail = (action: string, details: any) => {
    const timestamp = new Date();
    const auditEntry = {
      timestamp,
      action,
      hash: SHA256(`${timestamp.toISOString()}-${action}-${JSON.stringify(details)}`),
      details
    };
    
    setAuditTrail(prev => [auditEntry, ...prev.slice(0, 19)]); // Keep last 20 entries
    onAuditLog(action, details);
  };

  const addKeywordFilter = () => {
    if (newKeyword.trim() && !keywordFilters.includes(newKeyword.trim())) {
      const updatedFilters = [...keywordFilters, newKeyword.trim()];
      setKeywordFilters(updatedFilters);
      setNewKeyword('');
      addToAuditTrail('KEYWORD_FILTER_ADDED', { keyword: newKeyword.trim() });
    }
  };

  const removeKeywordFilter = (keyword: string) => {
    setKeywordFilters(prev => prev.filter(k => k !== keyword));
    addToAuditTrail('KEYWORD_FILTER_REMOVED', { keyword });
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Hash', 'Details'],
      ...auditTrail.map(entry => [
        entry.timestamp.toISOString(),
        entry.action,
        entry.hash,
        JSON.stringify(entry.details)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syntra_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToAuditTrail('AUDIT_LOG_EXPORTED', { entryCount: auditTrail.length });
  };

  const importKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const keys = JSON.parse(content);
          setEncryptionKey(keys.encryptionKey || '');
          addToAuditTrail('KEYS_IMPORTED', { fileSize: file.size });
        } catch (error) {
          console.error('SecurityPanel: Error importing keys', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const exportKeys = () => {
    const keyData = {
      encryptionKey,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syntra_keys_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToAuditTrail('KEYS_EXPORTED', { timestamp: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      {/* Main Security Controls */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          Security Controls
        </h3>

        <div className="space-y-4">
          {/* Encryption Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">End-to-End Encryption</p>
              <p className="text-sm text-slate-400">Encrypt all conversation data</p>
            </div>
            <Switch
              checked={encryptionEnabled}
              onCheckedChange={onEncryptionToggle}
            />
          </div>

          {/* Encryption Key Management */}
          {encryptionEnabled && (
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">Encryption Key</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                    className="text-slate-300 border-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSecureKey}
                    className="text-slate-300 border-slate-600"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              <Input
                type={showKey ? "text" : "password"}
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="Enter or generate encryption key"
                className="bg-slate-700/50 border-slate-600 text-white font-mono text-sm"
              />

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportKeys}
                  className="text-slate-300 border-slate-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Keys
                </Button>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-slate-300 border-slate-600"
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Keys
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importKeys}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-slate-400">Add extra security layer</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          {twoFactorEnabled && qrCode && (
            <div className="pt-4 text-center">
              <p className="text-sm text-slate-400 mb-3">Scan QR code with your authenticator app</p>
              <div className="inline-block p-4 bg-white rounded-lg">
                <QRCode value={qrCode} size={150} />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Keyword Redaction */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-yellow-400" />
          Keyword Redaction
        </h3>

        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Add sensitive keywords to automatically redact from logs
          </p>

          <div className="flex space-x-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Enter sensitive keyword"
              className="bg-slate-700/50 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && addKeywordFilter()}
            />
            <Button
              onClick={addKeywordFilter}
              variant="outline"
              className="text-slate-300 border-slate-600"
            >
              Add
            </Button>
          </div>

          {keywordFilters.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {keywordFilters.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-yellow-400 border-yellow-400 bg-yellow-400/10 cursor-pointer"
                    onClick={() => removeKeywordFilter(keyword)}
                  >
                    {keyword}
                    <button className="ml-2 hover:text-yellow-300">×</button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Audit Trail */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
            Audit Trail
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAuditLog}
            className="text-slate-300 border-slate-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {auditTrail.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No audit entries yet</p>
          ) : (
            auditTrail.map((entry, index) => (
              <motion.div
                key={index}
                className="p-3 bg-slate-700/30 rounded border border-slate-600/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-blue-400 border-blue-400 bg-blue-400/10">
                    {entry.action.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Hash: {entry.hash.substring(0, 16)}...
                </p>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}