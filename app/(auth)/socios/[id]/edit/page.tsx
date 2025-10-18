"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { PhotoCropper } from "@/components/photo-cropper";
import { MemberForm } from "@/components/member-form";
import { SocioWithFoto } from "@/lib/types";
import { useSocioById } from "@/hooks/api/socios/useSocios";
import { useUpdateSocio } from "@/hooks/api/socios/useUpdateSocio";
import { logError } from "@/lib/errors/error.adapter";

export default function EditMemberPage() {
  const router = useRouter();
  const { id } = useParams();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const { data: socio } = useSocioById(parseInt(id as string));
  const { mutateAsync: updateSocio } = useUpdateSocio();

  // Cargar foto inicial de Cloudinary si existe
  useEffect(() => {
    if (socio?.fotoUrl) {
      setPhotoPreview(socio.fotoUrl);
    }
  }, [socio]);

  const handleUpdateSocio = async (formData: Omit<SocioWithFoto, "id">) => {
    const formDataToSend = new FormData();
  
    // Campos comunes (excepto foto, fotoUrl, eliminarFotoVieja)
    Object.entries(formData).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        key !== "foto" &&
        key !== "fotoUrl" &&
        key !== "eliminarFotoVieja"
      ) {
        formDataToSend.append(key, String(value));
      }
    });
  
    const teniaFoto = Boolean(socio?.fotoUrl);
    const isDataUrl = (v?: string) => !!v && v.startsWith("data:");
  
    if (photoPreview) {
      if (isDataUrl(photoPreview)) {
        // 👉 Nueva foto: la subimos
        const photoFile = dataURLtoFile(
          photoPreview,
          `${formData.nombre}-${formData.apellido}-FOTO-PERFIL.jpg`
        );
        formDataToSend.append("foto", photoFile);
  
        if (socio?.fotoUrl) {
          formDataToSend.append("fotoUrl", socio.fotoUrl);
          formDataToSend.append("eliminarFotoVieja", "true"); // reemplazo → borro la anterior
        }
      }
      // Si es una URL igual a la existente, no mandamos nada → mantiene foto
    } else {
      if (teniaFoto && socio?.fotoUrl) {
        // 👉 El usuario borró la foto manualmente
        formDataToSend.append("fotoUrl", socio.fotoUrl);
        formDataToSend.append("eliminarFotoVieja", "true");
      }
    }

    try {
      await updateSocio({id: parseInt(id as string), data: formDataToSend});
      router.push("/socios");
    } catch (error) {
      // El error ya fue mostrado en el hook de API
      logError(error, "EditMemberPage");
    }
  };
  

  // Convertir Data URL a File
  const dataURLtoFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      setPhotoError(null);
      const reader = new FileReader();
      reader.onload = (e) => setCropSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
      setPhotoError("El archivo debe ser una imagen (jpg, png, etc.)");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const removePhoto = () => setPhotoPreview(null);

  return (
    <div className="min-h-screen flex items-center">
      <div className="container mx-auto px-4 my-4 max-w-4xl">
        <Card className="w-full">
          <div className="grid sm:grid-cols-3 grid-cols-2 justify-between items-center gap-4 mb-6 px-6">
            <Link href="/socios">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground text-center">
              Editar Socio
            </h1>
          </div>

          <CardContent>
            {/* Photo Upload */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium">Foto del Socio</label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                {photoPreview ? (
                  <div className="relative inline-block">
                    <Image
                      src={photoPreview}
                      alt="Vista previa"
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full object-cover mx-auto outline-2"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                      onClick={removePhoto}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Arrastra una imagen aquí o
                      </p>
                      <Button type="button" variant="outline" asChild>
                        <label className="cursor-pointer">
                          Seleccionar archivo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileInput}
                          />
                        </label>
                      </Button>
                    </div>
                    {photoError && (
                      <p className="text-sm text-destructive mt-2">
                        {photoError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Member Form */}
            <MemberForm
              socio={socio}
              onSubmit={handleUpdateSocio}
              onCancel={() => router.push("/socios")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal de recorte de imagen */}
      {cropSrc && (
        <PhotoCropper
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onSave={(cropped) => {
            setPhotoPreview(cropped);
            setPhotoError(null);
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
}
