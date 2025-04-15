import { CloseIcon } from '@chakra-ui/icons';
import { Box, Button, Input, InputProps, Spinner, Text, useToast } from '@chakra-ui/react';
import { ChangeEvent, DragEvent, useState } from 'react';
import { FaFileUpload } from 'react-icons/fa';

type FileUploaderProps = InputProps & {
  value?: string;
  onChange?: (val: string | undefined) => unknown;
  upload: (file: File) => Promise<string>;
  label?: string;
};

const isDragEvent = (
  event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLInputElement> | DragEvent<HTMLLabelElement>
): event is DragEvent<HTMLInputElement> | DragEvent<HTMLLabelElement> => {
  return 'dataTransfer' in event;
};

export function FileUploader({ label, value, onChange, upload, ...props }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleChange = async (
    event: ChangeEvent<HTMLInputElement> | DragEvent<HTMLInputElement> | DragEvent<HTMLLabelElement>
  ) => {
    const file = isDragEvent(event) ? event.dataTransfer?.files?.[0] : event.target?.files?.[0];

    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 1MB',
        status: 'error'
      });
      return;
    }

    setUploading(true);
    try {
      const url = await upload(file);
      onChange?.(url);
      toast({
        title: 'File uploaded',
        description: 'File uploaded successfully',
        status: 'success'
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error uploading file',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <Box w="100%" position="relative" bg="gray.200" borderRadius="md">
        <img
          src={value}
          alt="Uploaded file"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Button
          position="absolute"
          top={-4}
          right={-4}
          size="sm"
          variant="outline"
          colorScheme="gray"
          bg="white"
          borderRadius="full"
          p={3}
          onClick={() => {
            onChange?.(undefined);
          }}
        >
          <CloseIcon w={2} h={2} />
        </Button>
      </Box>
    );
  }

  return (
    <Box w="100%">
      <label
        htmlFor={props.id}
        onDrop={(e) => {
          e.preventDefault();
          handleChange(e);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <Box
          w="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          px={12}
          py={12}
          border="1px dashed"
          borderColor="gray.400"
          borderRadius="md"
        >
          <Text textAlign="center">{label || 'Drag and drop or click to upload a file'}</Text>
          <Box textColor="gray.400">
            {uploading ? <Spinner color="inherit" /> : <FaFileUpload size={24} color="inherit" />}
          </Box>
        </Box>
      </label>
      <Input
        {...props}
        type="file"
        p={0}
        border="none"
        accept="image/*"
        onChange={handleChange}
        onDrop={(e) => {
          e.preventDefault();
          handleChange(e);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
