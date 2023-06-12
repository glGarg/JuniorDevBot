// ---------------------------------------------------------------------------
// <copyright file="Scrubber.cs" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------

namespace ScrubberNamespace
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.RegularExpressions;

    public class Scrubber
    {
        public const string EmailRegExPattern = @"[a-zA-Z0-9!#$+\-^_~]+(?:\.[a-zA-Z0-9!#$+\-^_~]+)*@(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,6}";
	public static string ScrubData(string data, char replacementChar){
            Regex rx = new Regex(EmailRegExPattern);
            StringBuilder sb = new StringBuilder(data);
            foreach (Match match in rx.Matches(data))
            {
                string replacementString = new string(replacementChar, match.Value.Length);
                sb.Replace(match.Value, replacementString, match.Index, match.Length);
            }

            return sb.ToString();
        }
    }
}
