import React from 'react';
import { get, partition } from 'lodash';
import { defineMessages, useIntl } from 'react-intl';

import I18nFormatters from '../../components/I18nFormatters';
import { TOAST_TYPE, useToasts } from '../../components/ToastProvider';

import { uploadImageWithXHR } from '../api';
import { getErrorFromXhrUpload } from '../errors';
import { allSettled } from '../utils';

const msg = defineMessages({
  invalidFiles: {
    id: 'StyledDropzone.InvalidFiles',
    defaultMessage: 'The following {count, plural, one {file is} other {files are}} not valid: {files}',
  },
});

/** Fets the average progress from a list of upload progress */
const getUploadProgress = uploadProgressList => {
  if (!uploadProgressList || uploadProgressList.length === 0) {
    return 0;
  } else {
    const totalUploadProgress = uploadProgressList.reduce((total, current) => total + current, 0);
    return Math.trunc(totalUploadProgress / uploadProgressList.length);
  }
};

export const useImageUploader = ({ isMulti, mockImageGenerator, onSuccess, onReject }) => {
  const [isUploading, setUploading] = React.useState(false);
  const [uploadProgressList, setUploadProgressList] = React.useState([]);
  const { addToast } = useToasts();
  const intl = useIntl();
  return {
    isUploading,
    uploadProgress: getUploadProgress(uploadProgressList),
    uploadFiles: React.useCallback(
      async (acceptedFiles, rejectedFiles) => {
        setUploading(true);
        const filesToUpload = isMulti ? acceptedFiles : [acceptedFiles[0]];
        const results = await allSettled(
          filesToUpload.map((file, index) =>
            uploadImageWithXHR(file, {
              mockImage: mockImageGenerator && mockImageGenerator(index),
              onProgress: progress => {
                const newProgressList = [...uploadProgressList];
                newProgressList.splice(index, 0, progress);
                setUploadProgressList(newProgressList);
              },
            }),
          ),
        );

        setUploading(false);

        const [successes, failures] = partition(results, r => r.status === 'fulfilled');
        const getResultValue = r => r.value;
        const getRejectReason = r => getErrorFromXhrUpload(r.reason);

        if (onSuccess && successes.length > 0) {
          await onSuccess(isMulti ? successes.map(getResultValue) : getResultValue(successes[0]));
        }

        if (onReject && failures.length > 0) {
          onReject(isMulti ? failures.map(getRejectReason) : getRejectReason(failures[0]));
        }

        if (rejectedFiles?.length) {
          const baseMsg = intl.formatMessage(msg.invalidFiles, { ...I18nFormatters, count: rejectedFiles.length });
          const errorMsg = get(rejectedFiles[0], 'errors.0.message') || '';
          addToast({ type: TOAST_TYPE.ERROR, message: `${baseMsg}. ${errorMsg}` });
        }
      },
      [isMulti, onSuccess, onReject, mockImageGenerator, uploadProgressList],
    ),
  };
};
