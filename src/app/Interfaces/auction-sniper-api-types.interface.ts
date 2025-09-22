export namespace AuctionSniperApiTypes {

    export interface CreateSnipeParameters {
         Id?: number;
         Item: string;
         MaxBid: string;
         Delay: number;
         Title?: string;
         BidEnhancement?: number;
         Comment?: string;
         ShipInsure: boolean;
     }
     export interface RegisterParameters {
         UserName: string;
         Email: string;
         Password: string;
         Timezone: number;
         Usage?: string;
         ADID: string;
     }
     export interface LoginParameters {
         UserName: string;
         Password: string;
         ADID: string;
         LaunchLinkInfo: string;
     }
     export interface AccountInformationParameters extends AccountInformation {
         Password: string;
     }
     export interface AppLaunchParameters {
         ADID?: string;
         PushNotificationDeviceToken: string;
     }
    export interface BaseResult {
        success: boolean;
        message: Message;
        authorized?: boolean;
    }

    export interface ConfigResult extends BaseResult {
        settings: ConfigSetting;
    }
    export interface ConfigSetting {
        OSType: string;
        AdsEnabled: string;
    }
    export interface LogonResult extends BaseResult {
        user: User;
    }
    export interface LogoffResult {
        User: User;
    }
    export interface RegisterResult extends BaseResult {
        User: User;
    }
    export interface DeleteAccountResult extends BaseResult {
      
    }
    export interface GetUserResult extends BaseResult {
        user: User;
    }
    export interface EbayTokenStatusResult extends BaseResult {
        response: EbayTokenStatus;
    }
     export interface AccountInformationResult extends BaseResult {
         info: AccountInformation;
     }
     export interface AccountPreferencesResult extends BaseResult {
         preferences: Preferences;
     }
     export interface AccountNotificationPreferencesResult extends BaseResult {
         preferences: NotificationPreferences;
     }

     export interface AccountPaymentInformationResult extends BaseResult {
         paymentInfo: PaymentInformation;
     }
     export interface ResendActivationEmailResult extends BaseResult {
     }
    export interface ListSavedSearchResults extends BaseResult {
        searches: SparseSavedSearch[];
        total: number;
    }
    export interface RetrieveSavedSearchResult extends BaseResult {
        search: SavedSearch;
    }
    export interface SearchQueryResult extends BaseResult {
        count: number;
        items: SearchResult[];
    }
    export interface DealsResult extends BaseResult {
        count: number;
        items: Deal[];
    }
     export interface CreateWatchParameters {
        itemNumber: string;
        watchQuantity: number;
        watchPrice: string;
        folderId: number;
        comment: string;
     }
      export interface DeleteWatchResult extends BaseResult {
          watch: Watch;
      }
    export interface SearchItemInfoResult extends BaseResult {
        item: SearchResult;
    }
    export interface WatchListResult extends BaseResult {
        watches: Watch[];
        total: number;
    }
    export interface WinListResult extends BaseResult {
        wins: Win[];
        total: number;
    }
     export interface SnipeListResult extends BaseResult {
         count: number;
         snipes: Snipe[];
     }
     export interface CreateSnipeResult extends BaseResult {
         snipe: Snipe;
     }
      export interface DeleteSnipeResult extends BaseResult {
          snipe: Snipe;
      }
    export interface DateString extends String {
    }
    export interface Message {
        Level: MessageLevel;
        MessageContent: string;
    }
    export enum MessageLevel {
        Error = -1,
        None = 0,
        Slap = 1,
        Info = 2,
        Warning = 3
    }
    export interface User {
        Id: number;
        UserName: string;
        Email: string;
        Key: string;
        Credits: number;
    }
    export interface AccountInformation {
        UserID: string;
        Email: string;
        FirstName: string;
        LastName: string;
        Address1: string;
        Address2: string;
        City: string;
        State: string;
        Zip: string;
    }
    export interface EbayTokenStatus {
        IsValid: boolean;
        ExpireDate: string;
        IsNull: boolean;
    }
    export interface Preferences {
        Delay: number;
        DefaultShowShipInsurance: boolean;
        DefaultShipInsureAll: boolean;
        ShowSnipeComment: boolean;
        Thumb: boolean;
        Timezone: number;
        TimezoneDST: boolean;
    }
    export interface NotificationPreferences {
        EmailStatus: boolean;
        EmailNews: boolean;
        EmailPromo: boolean;
        EmailReminders: boolean;
        EmailOutbid: boolean;
        EmailStyle: string;
    }
    export interface PaymentInformation {
        Balance: number;
        Credits: number;
        UnpaidWinSnipesTotal: number;
        UnpaidShippingInsuranceTotal: number;
        UnpaidInvoicesTotal: number;
    }
    export interface SniperUser {
        UID: number;
        FirstName: string;
        LastName: string;
        UserID: string;
        Password: string;
        Email: string;
        Bids: number;
        Since: DateString;
        LastLogin: DateString;
        Active: number;
        Credits: number;
        Balance: number;
        Carry: number;
        HowDidYouKnow: string;
        ReferralText: string;
        Referrer: number;
        SReferrer: number;
        HowUrl: string;
        SnipesCount: number;
        Site: number;
        Affiliate: boolean;
        AccountStatus: number;
        BlockCC: boolean;
        Address1: string;
        Address2: string;
        City: string;
        State: string;
        Zip: string;
        Country: string;
        CountryId: number;
        Preferences: {
          Delay: number;
          EmailStatus: number;
          EmailOutbid: number;
          EmailNews: number;
          EmailPromo: number;
          EmailReminders: number;
          EmailStyle: string;
          AutoAppend: number;
          Thumb: number;
          Sound: number;
          Wav: string;
          Wav2: string;
          DefaultFolder: number;
          DefaultFolderSort: number;
          DefaultView: number;
          DefaultRowsPerPage: number;
          MobileEmail: string;
          MobileOutbid: number;
          MobileSnipe: number;
          ShowSnipeComment: number;
          DefaultShowShipInsurance: boolean;
          DefaultShipInsureAll: boolean;
          DefaultWatchView: number;
          DefaultWatchFolder: number;
          DefaultWatchFolderSort: number;
          DefaultWatchesPerPage: number;
          AutoDeleteWatch: boolean
        };
        BonusCode: string;
        Folders: UserFolder[];
        Feedbacks: FeedbackInfo[];
        SnipeInfoUpdate: DateString;
        AmountOwed: number;
        LastWatchesUpdated: DateString;
        ImportWarning: number;
        Timezone: number;
        TimezoneDST: boolean;
        SnipeEndUpdate: number;
        ShowSearchBar: boolean;
        DefaultSearchSite: string;
    }
    export interface UserFolder {
        folderID: number;
        name: string;
        description: string;
        active: number;
        win: number;
        won: number;
        foldercolor: string;
        type: FolderType;
    }
    export enum FolderType {
        REGULAR = 0,
        BIDGROUP = 1
    }

    /**
     * Describes a single feedback information object.
     */
    export interface FeedbackInfo {
        FeedbackID: number;
        Type: number;
        Message: string;
    }

    /**
     * Minimally describes a single saved search.
     */
    export interface SparseSavedSearch {
        Id: number;
        Title: string;
        AllWords: string;
        PriceMin: number;
        PriceMax: number;
        Currency: string;
    }

    /**
     * Describes a saved search.
     */
    export interface SavedSearch extends SparseSavedSearch {
        Page: number;
        ExcludeWords: string;
        Category: string;
        PageKey: string; //TODO: Confirm this type.
    }

    /**
     * Describes a single search result.
     */
    export interface SearchResult {
        Id: string;
        Title: string;
        Currency: string;
        EndTime: string;
        CountDownTime: string;
        EndTimeUtc: string;
        HasEnded: boolean;
        BuyItNow: boolean;
        BuyItNowPrice: number;
        Auction: boolean;
        Bids: number;
        CurrentPrice: number;
        MinimumBid: number;
        FreeShipping: boolean;
        ThumbnailUrl: string;
        PictureUrl: string;
    }

    /**
     * Describes a single snipe info result.
     */
    export interface SnipeInfoResult extends BaseResult {
        snipe: SnipeInfo;
    }

    /**
     * Describes a "daily deal" item.
     */
    export interface Deal {
        ItemId: string;
        Title: string;
        SmallPictureUrl: string;
        Picture175Url: string;
        Description: string;
        DealUrl: string;
        ConvertedCurrentPrice: number;
        SavingsRate: string;
    }

    /**
     * Describes a saved watch for an item.
     */
    export interface Watch {
        WID: number;
        UID: number;
        itemnumber: string;
        title: string;
        quantity: number;
        itemquantity: number;
        watchPrice: string;
        endtime: string;
        endtimeUtc: string;
        countdowntime: string;
        seller: string;
        sellerrating: number;
        CurrentPrice: string;
        thumbnail: string;
        folderid: number;
        comment: string;
        currency: string;
        numbids: number;
        shipping: string;
        EbayItemType: number;
    }

    /**
     * Describes a Win (auction)for an item.
     */
    export interface Win {
        UID: number;
        itemNumber: string;
        Title: string;
        ImageUrl: string;
        EndTime: string;
        EndTimeUtc: string;
        SellingPrice: string;
        Currency: String;
        CurrentPrice: string;
        SellerId: string;
    }

    export enum SnipeStatus {
        Active = 1,
        Won = 2,
        Lost = 3,
    }

    /**
     * Describes a snipe list item.
     */
    export interface Snipe {
        Id: number;
        Item: string;
        Title: string;
        Currency: string;
        MaxBid: string;
        BidEnhancement: number;
        CurrentPrice: string;
        NumBids: number;
        EndTime: string;
        CountDownTime: string;
        EndTimeUtc: string;
        Seller: string;
        Status: SnipeStatus;
        RowId: string;
        BidGroup: string;
        Thumbnail: string;
    }

    /**
     * Response for Get /Snipe
     */
     export interface SnipeInfo {
         Id: number;
         Item: string;
         Title: string;
         Currency: string;
         Comment: string;
         BidEnhancement: number;
         CurrentPrice: string;
         NumBids: number;
         MaxBid: number;
         Delay: number;
         EndTime: string;
         EndTimeUtc: string;
         Seller: string;
         Status: number;
         RowId: string;
         ShippingInsuranceID: number;
         BidGroup: string;
     }

    /**
     * Response for GET /AppLaunch
     */
     export interface AppLaunchResult extends BaseResult {
         WinsCount: number;

         /**
          * Indicates if the user has verified their email address.
          */
         isConfirmed: boolean;
     }
    }