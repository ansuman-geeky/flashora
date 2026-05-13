/**
 * Converter Service — Orchestrates file conversions
 */

import { LocalConversionProvider } from '../providers/LocalConversionProvider';
import type { ConversionRequest, ConversionResult, ConversionProvider } from '../types';

class ConverterService {
  private providers: ConversionProvider[] = [
    new LocalConversionProvider(),
  ];

  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const provider = this.findProvider(request);
    
    if (!provider) {
      throw new Error(`No provider found for ${request.inputFile.mimeType} to ${request.targetFormat}`);
    }

    return provider.convert(request);
  }

  private findProvider(request: ConversionRequest): ConversionProvider | undefined {
    return this.providers.find(p => 
      p.supportedConversions.some(c => 
        (c.from === request.inputFile.mimeType.split('/')[1] || c.from === 'txt' && request.inputFile.mimeType === 'text/plain') && 
        c.to === request.targetFormat
      )
    );
  }
}

export const converterService = new ConverterService();
