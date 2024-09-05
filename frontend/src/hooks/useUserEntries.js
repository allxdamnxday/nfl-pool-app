import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUserEntriesWithPicks, addOrUpdatePick, fetchPickForWeek } from '../services/entryService';
import { useToast } from '../contexts/ToastContext';

const USER_ENTRIES_KEY = 'userEntries';
const USER_ENTRY_KEY = 'userEntry';
const PICK_FOR_WEEK_KEY = 'pickForWeek';

export const useUserEntries = () => {
  const showToast = useToast();

  return useQuery(USER_ENTRIES_KEY, getUserEntriesWithPicks, {
    onError: (error) => {
      console.error('Failed to fetch entries:', error);
      showToast('Failed to load entries. Please try again later.', 'error');
    },
    staleTime: 0, // Always refetch when mounting the component
  });
};

export const useUserEntry = (entryId) => {
  const showToast = useToast();

  return useQuery(
    [USER_ENTRY_KEY, entryId],
    () => getUserEntriesWithPicks().then(entries => entries.find(entry => entry._id === entryId)),
    {
      onError: (error) => {
        console.error('Failed to fetch entry:', error);
        showToast('Failed to load entry. Please try again later.', 'error');
      },
      staleTime: 0, // Always refetch when the entryId changes
      enabled: !!entryId,
    }
  );
};

export const useAddOrUpdatePick = () => {
  const queryClient = useQueryClient();
  const showToast = useToast();

  return useMutation(addOrUpdatePick, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(USER_ENTRIES_KEY);
      queryClient.invalidateQueries([USER_ENTRY_KEY, variables.entryId]);
      queryClient.invalidateQueries([PICK_FOR_WEEK_KEY, variables.entryId]);
      showToast('Pick successfully updated', 'success');
    },
    onError: (error) => {
      console.error('Error adding or updating pick:', error);
      showToast('Failed to update pick. Please try again.', 'error');
    },
  });
};

export const usePickForWeek = (entryId, entryNumber, week) => {
  const showToast = useToast();

  return useQuery(
    [PICK_FOR_WEEK_KEY, entryId, entryNumber, week],
    () => fetchPickForWeek({ entryId, entryNumber, week }),
    {
      onError: (error) => {
        console.error('Error fetching pick for week:', error);
        showToast('Failed to load pick. Please try again later.', 'error');
      },
      staleTime: 0, // Always refetch when any of the parameters change
      enabled: !!entryId && !!entryNumber && !!week, // Only run the query if all parameters are truthy
    }
  );
};

export const useGetUserEntries = () => {
  const showToast = useToast();

  return useQuery('userEntries', getUserEntries, {
    onError: (error) => {
      console.error('Failed to fetch entries:', error);
      showToast('Failed to load entries. Please try again later.', 'error');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};