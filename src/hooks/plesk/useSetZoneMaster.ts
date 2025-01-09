import { useMutation } from "@tanstack/react-query";
import { setZonemasterMutation } from "../../client/@tanstack/react-query.gen";

const useSetZoneMaster = () => {
  const { mutate: mutateZoneMaster, isSuccess, isError} = useMutation({
      ...setZonemasterMutation(),
  });

  return { mutateZoneMaster, isSuccess, isError };
};

export default useSetZoneMaster;
