import { useMutation } from "@tanstack/react-query";
import { setZonemasterMutation } from "../../client/@tanstack/react-query.gen";

const useSetZoneMaster = () => {
  const {
    mutate: mutateZoneMaster,
    isSuccess,
    isError,
    error,
  } = useMutation({
    ...setZonemasterMutation(),
  });

  return { mutateZoneMaster, isSuccess, isError, error };
};

export default useSetZoneMaster;
