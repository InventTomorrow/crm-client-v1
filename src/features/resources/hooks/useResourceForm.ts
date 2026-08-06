'use client';
import { usePresignedUpload } from '@/features/inventory/hooks/useProducts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateResource, useUpdateResource } from './useResources';
import {
  resourceFormSchema,
  type ResourceFormData,
  type ResourceFormInput,
  type TenantResource,
} from '../types';

const EMPTY_RESOURCE: ResourceFormInput = {
  label: '',
  description: '',
  resourceType: 'BROCHURE',
  fileUrl: '',
  mimeType: '',
  sizeBytes: 0,
  conditions: {},
  isActive: true,
};

/**
 * Owns the resource dialog for both create and edit. The upload happens before
 * submit — `fileUrl`/`mimeType`/`sizeBytes` are filled in from the picked file,
 * so the record is never saved pointing at a file that failed to land.
 */
export function useResourceForm(options: {
  editing: TenantResource | null;
  onSaved: () => void;
}) {
  const form = useForm<ResourceFormInput, unknown, ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: EMPTY_RESOURCE,
  });

  const { upload, isPending: isUploading, progress, phase } = usePresignedUpload('resources');
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

  useEffect(() => {
    form.reset(
      options.editing
        ? {
            label: options.editing.label,
            description: options.editing.description ?? '',
            resourceType: options.editing.resourceType,
            fileUrl: options.editing.fileUrl,
            mimeType: options.editing.mimeType,
            sizeBytes: options.editing.sizeBytes,
            conditions: options.editing.conditions ?? {},
            isActive: options.editing.isActive,
          }
        : EMPTY_RESOURCE,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.editing]);

  /** Uploads the picked file and records what the API needs to describe it. */
  const handleFilePicked = async (file: File): Promise<string> => {
    const uploadedUrl = await upload(file);
    form.setValue('fileUrl', uploadedUrl, { shouldValidate: true });
    form.setValue('mimeType', file.type || 'application/octet-stream');
    form.setValue('sizeBytes', file.size);
    // Default the label to the file name so the common case needs no typing.
    if (!form.getValues('label').trim()) {
      form.setValue('label', file.name.replace(/\.[^.]+$/, ''), { shouldValidate: true });
    }
    return uploadedUrl;
  };

  const clearFile = () => {
    form.setValue('fileUrl', '', { shouldValidate: true });
    form.setValue('mimeType', '');
    form.setValue('sizeBytes', 0);
  };

  const isSaving = createResource.isPending || updateResource.isPending;

  const handleSubmit = form.handleSubmit((formData) => {
    const payload: ResourceFormData = {
      ...formData,
      description: formData.description?.trim() || null,
    };

    if (options.editing) {
      updateResource.mutate(
        { resourceId: options.editing.id, payload },
        { onSuccess: () => options.onSaved() },
      );
      return;
    }

    createResource.mutate(payload, {
      onSuccess: () => {
        form.reset(EMPTY_RESOURCE);
        options.onSaved();
      },
    });
  });

  return {
    form,
    isSaving,
    isUploading,
    uploadProgress: progress,
    uploadPhase: phase,
    handleFilePicked,
    clearFile,
    handleSubmit,
    resetForm: () => form.reset(EMPTY_RESOURCE),
  };
}
